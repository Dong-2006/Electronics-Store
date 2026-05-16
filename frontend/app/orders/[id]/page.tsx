"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loading } from "@/components/common/Loading";
import { apiGet, getErrorMessage } from "@/lib/api";
import { formatCurrency, statusLabel } from "@/lib/utils";
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-md border bg-white p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Đơn hàng #{order.id}</h1>
            <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
          </div>
          <span className="h-fit rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">{statusLabel(order.status)}</span>
        </div>
        <div className="mt-5 grid gap-2 text-sm">
          <p><b>Người nhận:</b> {order.fullName}</p>
          <p><b>Điện thoại:</b> {order.phone}</p>
          <p><b>Địa chỉ:</b> {order.address}</p>
          <p><b>Thanh toán:</b> {order.paymentMethod}</p>
        </div>
        <div className="mt-6 divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 py-3">
              <span>{item.product.name} x {item.quantity}</span>
              <span className="font-semibold">{formatCurrency(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold">
          <span>Tổng cộng</span>
          <span className="text-primary-700">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
