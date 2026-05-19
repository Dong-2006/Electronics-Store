"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Product, ProductApprovalStatus } from "@/types";

type ProductsPayload = { items: Product[] };

export default function AdminProductApprovalsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<ProductApprovalStatus | "">("PENDING");

  async function load() {
    if (!session?.accessToken) return;
    const query = status ? `?approvalStatus=${status}&limit=50` : "?limit=50";
    const res = await apiGet<ApiResponse<ProductsPayload>>(`/admin/product-approvals${query}`, session.accessToken);
    setProducts(res.data.items);
  }

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, [session, status]);

  async function approve(id: number) {
    if (!session?.accessToken) return;
    await apiPut(`/admin/product-approvals/${id}/approve`, {}, session.accessToken);
    await load();
  }

  async function reject(id: number) {
    if (!session?.accessToken) return;
    const rejectReason = prompt("Lý do từ chối") || "Sản phẩm chưa đạt yêu cầu";
    await apiPut(`/admin/product-approvals/${id}/reject`, { rejectReason }, session.accessToken);
    await load();
  }

  return (
    <>
      <AdminHeader title="Duyệt sản phẩm" />
      <Select className="mb-4 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value as ProductApprovalStatus | "")}>
        <option value="">Tất cả trạng thái</option>
        {(["PENDING", "APPROVED", "REJECTED", "DRAFT"] as ProductApprovalStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
      <DataTable headers={["Sản phẩm", "Seller", "Giá", "Trạng thái", "Thông tin", "Thao tác"]}>
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
            <td className="space-x-2 px-4 py-3">
              {product.approvalStatus !== "APPROVED" && <Button onClick={() => approve(product.id)}>Duyệt</Button>}
              {product.approvalStatus !== "REJECTED" && <Button variant="danger" onClick={() => reject(product.id)}>Từ chối</Button>}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
