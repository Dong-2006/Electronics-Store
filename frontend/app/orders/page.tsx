"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { OrderCard } from "@/components/cart/OrderCard";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Order } from "@/types";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      apiGet<ApiResponse<Order[]>>("/orders/my-orders", session.accessToken)
        .then((res) => setOrders(res.data))
        .catch((error) => alert(getErrorMessage(error)))
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-5 text-2xl font-bold">Lịch sử đơn hàng</h1>
      {orders.length ? <div className="space-y-3">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div> : <EmptyState title="Bạn chưa có đơn hàng nào" />}
    </div>
  );
}
