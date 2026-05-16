"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Select } from "@/components/common/Select";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Order, OrderStatus } from "@/types";

const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const res = await apiGet<ApiResponse<Order[]>>("/admin/orders", session!.accessToken);
    setOrders(res.data);
  }

  useEffect(() => {
    if (session?.accessToken) load().catch((error) => alert(getErrorMessage(error)));
  }, [session]);

  return (
    <>
      <AdminHeader title="Quản lý đơn hàng" />
      <DataTable headers={["Mã", "Khách hàng", "Tổng", "Thanh toán", "Trạng thái"]}>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="px-4 py-3">#{order.id}</td>
            <td className="px-4 py-3">{order.fullName}<br /><span className="text-xs text-slate-500">{order.phone}</span></td>
            <td className="px-4 py-3">{formatCurrency(order.totalAmount)}</td>
            <td className="px-4 py-3">{order.paymentMethod}</td>
            <td className="px-4 py-3">
              <Select
                value={order.status}
                onChange={async (e) => {
                  await apiPut(`/admin/orders/${order.id}/status`, { status: e.target.value }, session!.accessToken);
                  await load();
                }}
              >
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </Select>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
