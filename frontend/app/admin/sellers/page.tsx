"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { ApiResponse, SellerProfile, SellerStatus } from "@/types";

type SellersPayload = { items: SellerProfile[] };

export default function AdminSellersPage() {
  const { data: session } = useSession();
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [status, setStatus] = useState("");

  async function load() {
    if (!session?.accessToken) return;
    const query = status ? `?status=${status}&limit=50` : "?limit=50";
    const res = await apiGet<ApiResponse<SellersPayload>>(`/admin/sellers${query}`, session.accessToken);
    setSellers(res.data.items);
  }

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, [session, status]);

  async function action(id: number, endpoint: string, body?: unknown) {
    if (!session?.accessToken) return;
    await apiPut(`/admin/sellers/${id}/${endpoint}`, body || {}, session.accessToken);
    await load();
  }

  return (
    <>
      <AdminHeader title="Duyệt seller" />
      <Select className="mb-4 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Tất cả trạng thái</option>
        {(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as SellerStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
      <DataTable headers={["Shop", "User", "Liên hệ", "Trạng thái", "Sản phẩm", "Thao tác"]}>
        {sellers.map((seller) => (
          <tr key={seller.id}>
            <td className="px-4 py-3">
              <p className="font-semibold">{seller.shopName}</p>
              <p className="text-xs text-slate-500">{seller.pickupAddress}</p>
              {seller.rejectReason && <p className="mt-1 text-xs text-red-700">{seller.rejectReason}</p>}
            </td>
            <td className="px-4 py-3">{seller.user?.email}</td>
            <td className="px-4 py-3">{seller.businessPhone}<br />{seller.businessEmail}</td>
            <td className="px-4 py-3"><StatusBadge status={seller.status} /></td>
            <td className="px-4 py-3">{seller._count?.products || 0}</td>
            <td className="space-x-2 px-4 py-3">
              {seller.status !== "APPROVED" && <Button onClick={() => action(seller.id, "approve")}>Duyệt</Button>}
              {seller.status === "PENDING" && <Button variant="danger" onClick={() => action(seller.id, "reject", { rejectReason: prompt("Lý do từ chối") || "Không đạt yêu cầu" })}>Từ chối</Button>}
              {seller.status === "APPROVED" && <Button variant="danger" onClick={() => action(seller.id, "suspend")}>Tạm khóa</Button>}
              {seller.status === "SUSPENDED" && <Button onClick={() => action(seller.id, "reactivate")}>Mở khóa</Button>}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
