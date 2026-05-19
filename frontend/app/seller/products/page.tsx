"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable } from "@/components/admin/DataTable";
import { apiDelete, apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Product, ProductApprovalStatus } from "@/types";

type ProductsPayload = { items: Product[] };

export default function SellerProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState("");

  const query = useMemo(() => status ? `?approvalStatus=${status}&limit=50` : "?limit=50", [status]);

  async function load() {
    if (!session?.accessToken) return;
    const res = await apiGet<ApiResponse<ProductsPayload>>(`/seller/products${query}`, session.accessToken);
    setProducts(res.data.items);
  }

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, [session, query]);

  async function hide(id: number) {
    if (!session?.accessToken) return;
    await apiDelete(`/seller/products/${id}`, session.accessToken);
    await load();
  }

  async function submit(id: number) {
    if (!session?.accessToken) return;
    await apiPut(`/seller/products/${id}/submit`, {}, session.accessToken);
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Products</h1>
          <p className="mt-1 text-sm text-slate-500">Quan ly san pham cua shop.</p>
        </div>
        <Link href="/seller/products/create"><Button>Them san pham</Button></Link>
      </div>
      <Select className="mb-4 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Tat ca trang thai</option>
        {(["PENDING", "APPROVED", "REJECTED", "DRAFT"] as ProductApprovalStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
      <DataTable headers={["Ten", "Gia", "Ton kho", "Trang thai", "Ly do tu choi", "Thao tac"]}>
        {products.map((product) => (
          <tr key={product.id}>
            <td className="px-4 py-3 font-semibold">{product.name}</td>
            <td className="px-4 py-3">{formatCurrency(product.discountPrice || product.price)}</td>
            <td className="px-4 py-3">{product.stock}</td>
            <td className="px-4 py-3"><StatusBadge status={product.approvalStatus} /></td>
            <td className="max-w-xs px-4 py-3 text-red-700">{product.rejectReason || "-"}</td>
            <td className="space-x-2 px-4 py-3">
              <Link href={`/seller/products/${product.id}/edit`}><Button variant="secondary">Sua</Button></Link>
              {(product.approvalStatus === "REJECTED" || product.approvalStatus === "DRAFT") && <Button onClick={() => submit(product.id)}>Gui duyet lai</Button>}
              <Button variant="danger" onClick={() => hide(product.id)}>An</Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
