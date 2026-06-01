"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/admin/DataTable";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";
import { SellerBulkUploadPanel } from "@/components/seller/SellerBulkUploadPanel";
import { apiDelete, apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Product, ProductApprovalStatus } from "@/types";

type ProductsPayload = { items: Product[] };

export default function SellerProductsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState(() => typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("status") || "" : "");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [hideId, setHideId] = useState<number | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const query = useMemo(() => {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", "50");
    if (status) searchParams.set("approvalStatus", status);
    if (search.trim()) searchParams.set("search", search.trim());
    return `?${searchParams.toString()}`;
  }, [status, search]);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await apiGet<ApiResponse<ProductsPayload>>(`/seller/products${query}`, session.accessToken);
      setProducts(res.data.items);
    } catch (error) {
      toast({ title: "Không tải được sản phẩm shop", description: getErrorMessage(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [query, session?.accessToken, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function hide() {
    if (!session?.accessToken || !hideId) return;
    try {
      await apiDelete(`/seller/products/${hideId}`, session.accessToken);
      toast({ title: "Đã ẩn sản phẩm", variant: "success" });
      setHideId(null);
      await load();
    } catch (error) {
      toast({ title: "Không thể ẩn sản phẩm", description: getErrorMessage(error), variant: "error" });
    }
  }

  async function submit(id: number) {
    if (!session?.accessToken) return;
    setSubmittingId(id);
    try {
      await apiPut(`/seller/products/${id}/submit`, {}, session.accessToken);
      toast({ title: "Đã gửi duyệt sản phẩm", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể gửi duyệt", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="muted-label text-emerald-700">Seller products</p>
          <h1 className="text-3xl font-black text-slate-950">Sản phẩm của shop</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý sản phẩm, trạng thái duyệt và nhập hàng loạt.</p>
        </div>
        <Link href="/seller/products/create"><Button><PlusCircle className="h-4 w-4" /> Thêm sản phẩm</Button></Link>
      </div>

      <SellerBulkUploadPanel token={session?.accessToken} onUploaded={load} />

      <TableToolbar
        title="Danh sách sản phẩm"
        description="Tìm kiếm, lọc trạng thái và xử lý sản phẩm."
        search={search}
        searchPlaceholder="Tìm sản phẩm..."
        onSearchChange={setSearch}
        filters={
          <Select className="w-56" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {(["PENDING", "APPROVED", "REJECTED", "DRAFT"] as ProductApprovalStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <DataTable headers={["Tên", "Giá", "Tồn kho", "Trạng thái", "Lý do từ chối", "Thao tác"]} empty={!products.length} emptyTitle="Chưa có sản phẩm nào">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 font-semibold">{product.name}</td>
              <td className="px-4 py-3">{formatCurrency(product.discountPrice || product.price)}</td>
              <td className="px-4 py-3">{product.stock}</td>
              <td className="px-4 py-3"><StatusBadge status={product.approvalStatus} /></td>
              <td className="max-w-xs px-4 py-3 text-red-700">{product.rejectReason || "-"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/seller/products/${product.id}/edit`}><Button size="sm" variant="secondary">Sửa</Button></Link>
                  {(product.approvalStatus === "REJECTED" || product.approvalStatus === "DRAFT") && (
                    <Button size="sm" onClick={() => submit(product.id)} isLoading={submittingId === product.id}>Gửi duyệt</Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => setHideId(product.id)}>Ẩn</Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <ConfirmDialog
        open={hideId !== null}
        title="Ẩn sản phẩm?"
        description="Sản phẩm sẽ không còn hiển thị công khai. Bạn có thể chỉnh sửa và gửi duyệt lại sau."
        confirmLabel="Ẩn sản phẩm"
        onClose={() => setHideId(null)}
        onConfirm={hide}
      />
    </div>
  );
}
