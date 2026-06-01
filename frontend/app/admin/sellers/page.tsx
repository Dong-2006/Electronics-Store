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
import { ApiResponse, SellerProfile, SellerStatus } from "@/types";

type SellersPayload = { items: SellerProfile[] };

export default function AdminSellersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const query = status ? `?status=${status}&limit=50` : "?limit=50";
      const res = await apiGet<ApiResponse<SellersPayload>>(`/admin/sellers${query}`, session.accessToken);
      setSellers(res.data.items);
    } catch (error) {
      toast({ title: "Không tải được danh sách seller", description: getErrorMessage(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.accessToken, status]);

  async function action(id: number, endpoint: string, body?: unknown) {
    if (!session?.accessToken) return;
    try {
      await apiPut(`/admin/sellers/${id}/${endpoint}`, body || {}, session.accessToken);
      toast({ title: "Đã cập nhật seller", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể cập nhật seller", description: getErrorMessage(error), variant: "error" });
    }
  }

  async function reject(event: FormEvent) {
    event.preventDefault();
    if (!rejectId) return;
    await action(rejectId, "reject", { rejectReason: rejectReason || "Không đạt yêu cầu" });
    setRejectId(null);
    setRejectReason("");
  }

  return (
    <>
      <AdminHeader title="Duyệt seller" description="Xét duyệt hồ sơ shop và quản lý trạng thái seller." />
      <TableToolbar
        filters={
          <Select className="w-56" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as SellerStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        }
      />
      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <DataTable headers={["Shop", "User", "Liên hệ", "Trạng thái", "Sản phẩm", "Thao tác"]} empty={!sellers.length}>
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
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {seller.status !== "APPROVED" && <Button size="sm" onClick={() => action(seller.id, "approve")}>Duyệt</Button>}
                  {seller.status === "PENDING" && <Button size="sm" variant="danger" onClick={() => setRejectId(seller.id)}>Từ chối</Button>}
                  {seller.status === "APPROVED" && <Button size="sm" variant="danger" onClick={() => action(seller.id, "suspend")}>Tạm khóa</Button>}
                  {seller.status === "SUSPENDED" && <Button size="sm" onClick={() => action(seller.id, "reactivate")}>Mở khóa</Button>}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal open={rejectId !== null} onClose={() => setRejectId(null)} title="Từ chối seller" description="Nhập lý do để seller có thể chỉnh sửa hồ sơ.">
        <form onSubmit={reject} className="space-y-4">
          <FormField label="Lý do từ chối">
            <Textarea required value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
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
