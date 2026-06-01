"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Loading } from "@/components/common/Loading";
import { useToast } from "@/components/common/Toast";
import { OrderTimeline } from "@/components/cart/OrderTimeline";
import { apiGet, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Order } from "@/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      apiGet<ApiResponse<Order>>(`/orders/${id}`, session.accessToken)
        .then((res) => setOrder(res.data))
        .catch((error) => toast({ title: "Không tải được chi tiết đơn hàng", description: getErrorMessage(error), variant: "error" }));
    }
  }, [status, session?.accessToken, id, router, toast]);

  if (!order) return <Loading />;

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Đơn hàng", href: "/orders" }, { label: `#${order.id}` }]} />
      <Card>
        <CardHeader
          title={`Đơn hàng #${order.id}`}
          description={new Date(order.createdAt).toLocaleString("vi-VN")}
          action={<StatusBadge status={order.status} />}
        />
        <CardContent className="space-y-5">
          <OrderTimeline status={order.status} />
          <div className="grid gap-3 rounded-md bg-slate-50 p-4 text-sm md:grid-cols-2">
            <p><b>Người nhận:</b> {order.fullName}</p>
            <p><b>Điện thoại:</b> {order.phone}</p>
            <p><b>Địa chỉ:</b> {order.address}</p>
            <p><b>Thanh toán:</b> {order.paymentMethod} - {order.paymentStatus}</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 space-y-4">
        {order.subOrders?.length ? order.subOrders.map((subOrder) => {
          const total = Number(subOrder.subTotal) + Number(subOrder.shippingFee) - Number(subOrder.discountAmount);
          return (
            <Card key={subOrder.id}>
              <CardHeader
                title={`${subOrder.seller?.shopName || "ElectroHub"} #${subOrder.id}`}
                description={subOrder.trackingNumber ? `Tracking: ${subOrder.trackingNumber}` : "Đơn hàng theo shop"}
                action={<StatusBadge status={subOrder.status} />}
              />
              <CardContent>
                <div className="divide-y divide-slate-100">
                  {subOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                      <span className="font-semibold text-slate-700">{item.product.name} x {item.quantity}</span>
                      <span className="font-bold">{formatCurrency(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-black">
                  <span>Tổng shop</span>
                  <span className="text-primary-700">{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <Card>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span className="font-semibold">{formatCurrency(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t pt-4 font-bold">
                <span>Tổng cộng</span>
                <span className="text-primary-700">{formatCurrency(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
