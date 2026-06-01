"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { Button } from "@/components/common/Button";
import { FormField } from "@/components/common/FormField";
import { Modal } from "@/components/common/Modal";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeleton";
import { Textarea } from "@/components/common/Textarea";
import { useToast } from "@/components/common/Toast";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Product, ProductApprovalStatus } from "@/types";

type ProductsPayload = { items: Product[] };

export default function AdminProductApprovalsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<ProductApprovalStatus | "">("PENDING");
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const query = status ? `?approvalStatus=${status}&limit=50` : "?limit=50";
      const res = await apiGet<ApiResponse<ProductsPayload>>(`/admin/product-approvals${query}`, session.accessToken);
      setProducts(res.data.items);
    } catch (error) {
      toast({ title: "Không tải được danh sách duyệt", description: getErrorMessage(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.accessToken, status]);

  async function approve(id: number) {
    if (!session?.accessToken) return;
    try {
      await apiPut(`/admin/product-approvals/${id}/approve`, {}, session.accessToken);
      toast({ title: "Đã duyệt sản phẩm", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể duyệt sản phẩm", description: getErrorMessage(error), variant: "error" });
    }
  }

  async function reject(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !rejectId) return;
    try {
      await apiPut(`/admin/product-approvals/${rejectId}/reject`, { rejectReason: rejectReason || "Sản phẩm chưa đạt yêu cầu" }, session.accessToken);
      setRejectId(null);
      setRejectReason("");
      toast({ title: "Đã từ chối sản phẩm", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể từ chối sản phẩm", description: getErrorMessage(error), variant: "error" });
    }
  }

  return (
    <>
      <AdminHeader title="Duyệt sản phẩm" description="Kiểm tra sản phẩm seller gửi lên trước khi hiển thị công khai." />
      <TableToolbar
        filters={
          <Select className="w-56" value={status} onChange={(event) => setStatus(event.target.value as ProductApprovalStatus | "")}>
            <option value="">Tất cả trạng thái</option>
            {(["PENDING", "APPROVED", "REJECTED", "DRAFT"] as ProductApprovalStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        }
      />
      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <DataTable headers={["Sản phẩm", "Seller", "Giá", "Trạng thái", "Thông tin", "Thao tác"]} empty={!products.length}>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3">
                <p className="font-semibold">{product.name}</p>
                <p className="max-w-md text-xs text-slate-500">{product.description}</p>
              </td>
              <td className="px-4 py-3">{product.seller?.shopName || "Admin"}</td>
              <td className="px-4 py-3">{formatCurrency(product.discountPrice || product.price)}</td>
              <td className="px-4 py-3"><StatusBadge status={product.approvalStatus} /></td>
              <td className="px-4 py-3 text-xs">
                {product.category?.name} / {product.brand?.name}
                {product.rejectReason && <p className="mt-1 text-red-700">{product.rejectReason}</p>}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {product.approvalStatus !== "APPROVED" && <Button size="sm" onClick={() => approve(product.id)}>Duyệt</Button>}
                  {product.approvalStatus !== "REJECTED" && <Button size="sm" variant="danger" onClick={() => setRejectId(product.id)}>Từ chối</Button>}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal open={rejectId !== null} onClose={() => setRejectId(null)} title="Từ chối sản phẩm" description="Nhập lý do rõ ràng để seller biết cần chỉnh sửa gì.">
        <form onSubmit={reject} className="space-y-4">
          <FormField label="Lý do từ chối">
            <Textarea required value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Ví dụ: thiếu ảnh thật, mô tả chưa đủ thông tin..." />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRejectId(null)}>Hủy</Button>
            <Button type="submit" variant="danger">Từ chối</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
