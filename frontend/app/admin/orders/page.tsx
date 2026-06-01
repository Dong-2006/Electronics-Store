"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Order, OrderStatus } from "@/types";

const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await apiGet<ApiResponse<Order[]>>("/admin/orders", session.accessToken);
      setOrders(res.data);
    } catch (error) {
      toast({ title: "Không tải được đơn hàng", description: getErrorMessage(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.accessToken]);

  async function updateStatus(orderId: number, status: string) {
    if (!session?.accessToken) return;
    try {
      await apiPut(`/admin/orders/${orderId}/status`, { status }, session.accessToken);
      toast({ title: "Đã cập nhật trạng thái đơn", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể cập nhật trạng thái", description: getErrorMessage(error), variant: "error" });
    }
  }

  return (
    <>
      <AdminHeader title="Quản lý đơn hàng" description="Theo dõi và cập nhật trạng thái đơn hàng toàn hệ thống." />
      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <DataTable headers={["Mã", "Khách hàng", "Tổng", "Thanh toán", "Trạng thái", "Cập nhật"]} empty={!orders.length}>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3 font-bold">#{order.id}</td>
              <td className="px-4 py-3">{order.fullName}<br /><span className="text-xs text-slate-500">{order.phone}</span></td>
              <td className="px-4 py-3 font-bold">{formatCurrency(order.totalAmount)}</td>
              <td className="px-4 py-3"><StatusBadge status={order.paymentMethod} /></td>
              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
              <td className="px-4 py-3">
                <Select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </Select>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
