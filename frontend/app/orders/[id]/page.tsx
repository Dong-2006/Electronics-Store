"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Loading } from "@/components/common/Loading";
import { apiGet, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Order } from "@/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      apiGet<ApiResponse<Order>>(`/orders/${id}`, session.accessToken)
        .then((res) => setOrder(res.data))
        .catch((error) => alert(getErrorMessage(error)));
    }
  }, [status, session, id, router]);

  if (!order) return <Loading />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-md border bg-white p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Đơn hàng #{order.id}</h1>
            <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="mt-5 grid gap-2 text-sm md:grid-cols-2">
          <p><b>Người nhận:</b> {order.fullName}</p>
          <p><b>Điện thoại:</b> {order.phone}</p>
          <p><b>Địa chỉ:</b> {order.address}</p>
          <p><b>Thanh toan:</b> {order.paymentMethod} - {order.paymentStatus}</p>
        </div>
      </div>

      {order.subOrders?.length ? (
        <div className="mt-5 space-y-4">
          {order.subOrders.map((subOrder) => {
          const total = Number(subOrder.subTotal) + Number(subOrder.shippingFee) - Number(subOrder.discountAmount);
          return (
            <section key={subOrder.id} className="rounded-md border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">{subOrder.seller?.shopName || "ElectroHub"} #{subOrder.id || order.id}</h2>
                  {subOrder.trackingNumber && <p className="text-sm text-slate-500">Tracking: {subOrder.trackingNumber}</p>}
                </div>
                <StatusBadge status={subOrder.status} />
              </div>
              <div className="mt-4 divide-y">
                {subOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span className="font-semibold">{formatCurrency(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t pt-4 font-bold">
                <span>Tổng shop</span>
                <span className="text-primary-700">{formatCurrency(total)}</span>
              </div>
            </section>
          );
          })}
        </div>
      ) : (
        <section className="mt-5 rounded-md border bg-white p-5">
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <span className="font-semibold">{formatCurrency(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t pt-4 font-bold">
            <span>Tổng cong</span>
            <span className="text-primary-700">{formatCurrency(order.totalAmount)}</span>
          </div>
        </section>
      )}
    </div>
  );
}
