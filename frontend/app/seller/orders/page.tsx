"use client";

import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { Button } from "@/components/common/Button";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeleton";
import { Textarea } from "@/components/common/Textarea";
import { useToast } from "@/components/common/Toast";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, SubOrder, SubOrderStatus } from "@/types";

const statuses: SubOrderStatus[] = ["PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function SellerOrdersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<SubOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<{ order: SubOrder; status: SubOrderStatus } | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await apiGet<ApiResponse<SubOrder[]>>("/seller/orders", session.accessToken);
      setOrders(res.data);
    } catch (error) {
      toast({ title: "Không tải được đơn hàng shop", description: getErrorMessage(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.accessToken]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => !statusFilter || order.status === statusFilter),
    [orders, statusFilter]
  );

  function openUpdate(order: SubOrder, status: SubOrderStatus) {
    setEditing({ order, status });
    setTrackingNumber(order.trackingNumber || "");
    setCancelReason(order.cancelReason || "");
  }

  async function updateStatus(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !editing) return;
    setSubmitting(true);
    try {
      await apiPut(
        `/seller/orders/${editing.order.id}/status`,
        { status: editing.status, trackingNumber, cancelReason },
        session.accessToken
      );
      toast({ title: "Đã cập nhật đơn hàng", variant: "success" });
      setEditing(null);
      await load();
    } catch (error) {
      toast({ title: "Không thể cập nhật đơn hàng", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="muted-label text-emerald-700">Seller orders</p>
        <h1 className="text-3xl font-black text-slate-950">Đơn hàng của shop</h1>
        <p className="mt-1 text-sm text-slate-500">Xử lý từng sub-order thuộc shop của bạn.</p>
      </div>

      <TableToolbar
        title="Danh sách đơn hàng"
        filters={
          <Select className="w-56" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <DataTable headers={["Mã", "Khách", "Sản phẩm", "Tổng", "Trạng thái", "Cập nhật"]} empty={!filteredOrders.length}>
          {filteredOrders.map((order) => {
            const total = Number(order.subTotal) + Number(order.shippingFee) - Number(order.discountAmount);
            return (
              <tr key={order.id}>
                <td className="px-4 py-3 font-semibold">#{order.id}<p className="text-xs text-slate-500">Order #{order.orderId}</p></td>
                <td className="px-4 py-3">
                  <p>{order.order?.fullName}</p>
                  <p className="text-xs text-slate-500">{order.order?.phone}</p>
                </td>
                <td className="max-w-sm px-4 py-3">{order.items.slice(0, 2).map((item) => `${item.product.name} x${item.quantity}`).join(", ")}</td>
                <td className="px-4 py-3 font-bold">{formatCurrency(total)}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3">
                  <Select className="h-10 w-40" value={order.status} onChange={(event) => openUpdate(order, event.target.value as SubOrderStatus)}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </Select>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Cập nhật trạng thái đơn hàng"
        description={editing ? `Sub-order #${editing.order.id} chuyển sang ${editing.status}` : ""}
      >
        <form onSubmit={updateStatus} className="space-y-4">
          {editing?.status === "SHIPPED" && (
            <FormField label="Mã vận đơn">
              <Input required value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} />
            </FormField>
          )}
          {editing?.status === "CANCELLED" && (
            <FormField label="Lý do hủy">
              <Textarea required value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} />
            </FormField>
          )}
          {editing?.status !== "SHIPPED" && editing?.status !== "CANCELLED" && (
            <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">Xác nhận cập nhật trạng thái đơn hàng.</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Hủy</Button>
            <Button type="submit" isLoading={submitting} loadingText="Đang cập nhật">Cập nhật</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
