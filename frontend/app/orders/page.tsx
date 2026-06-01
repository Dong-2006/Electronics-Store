"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { useToast } from "@/components/common/Toast";
import { OrderCard } from "@/components/cart/OrderCard";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Order } from "@/types";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      apiGet<ApiResponse<Order[]>>("/orders/my-orders", session.accessToken)
        .then((res) => setOrders(res.data))
        .catch((error) => toast({ title: "Không tải được đơn hàng", description: getErrorMessage(error), variant: "error" }))
        .finally(() => setLoading(false));
    }
  }, [status, session?.accessToken, router, toast]);

  if (loading) return <Loading />;

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Đơn hàng" }]} />
      <div className="mb-6">
        <p className="muted-label text-primary-700">Orders</p>
        <h1 className="section-title mt-1">Lịch sử đơn hàng</h1>
      </div>
      {orders.length ? (
        <div className="grid gap-4">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
      ) : (
        <EmptyState
          title="Bạn chưa có đơn hàng nào"
          description="Khi đặt hàng thành công, lịch sử mua hàng sẽ xuất hiện tại đây."
          action={<Link href="/products"><Button>Khám phá sản phẩm</Button></Link>}
        />
      )}
    </div>
  );
}
