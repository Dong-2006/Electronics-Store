"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, SubOrder, SubOrderStatus } from "@/types";

const statuses: SubOrderStatus[] = ["PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function SellerOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<SubOrder[]>([]);

  async function load() {
    if (!session?.accessToken) return;
    const res = await apiGet<ApiResponse<SubOrder[]>>("/seller/orders", session.accessToken);
    setOrders(res.data);
  }

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, [session?.accessToken]);

  async function updateStatus(order: SubOrder, status: SubOrderStatus) {
    if (!session?.accessToken) return;
    const trackingNumber = status === "SHIPPED" ? window.prompt("Mã vận đơn") || "" : undefined;
    const cancelReason = status === "CANCELLED" ? window.prompt("Lý do huy") || "" : undefined;
    await apiPut(`/seller/orders/${order.id}/status`, { status, trackingNumber, cancelReason }, session.accessToken);
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Seller Orders</h1>
      <p className="mt-1 text-sm text-slate-500">Xu ly tung sub-order của shop.</p>
      <div className="mt-5">
        <DataTable headers={["Mã", "Khách", "Sản phẩm", "Tổng", "Trạng thái", "Cập nhật"]}>
          {orders.map((order) => {
            const total = Number(order.subTotal) + Number(order.shippingFee) - Number(order.discountAmount);
            return (
              <tr key={order.id}>
                <td className="px-4 py-3 font-semibold">#{order.id}<p className="text-xs text-slate-500">Order #{order.orderId}</p></td>
                <td className="px-4 py-3">
                  <p>{order.order?.fullName}</p>
                  <p className="text-xs text-slate-500">{order.order?.phone}</p>
                </td>
                <td className="px-4 py-3">{order.items.slice(0, 2).map((item) => `${item.product.name} x${item.quantity}`).join(", ")}</td>
                <td className="px-4 py-3">{formatCurrency(total)}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Select className="h-10 w-36" value={order.status} onChange={(e) => updateStatus(order, e.target.value as SubOrderStatus)}>
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </Select>
                    {order.trackingNumber && <Button variant="secondary" title={order.trackingNumber}>Track</Button>}
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </div>
  );
}
