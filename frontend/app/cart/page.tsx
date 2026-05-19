"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { apiDelete, apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Cart } from "@/types";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    const res = await apiGet<ApiResponse<Cart>>("/cart", session.accessToken);
    setCart(res.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) load().catch((error) => alert(getErrorMessage(error)));
  }, [status, session?.accessToken, router, load]);

  const total = cart?.items.reduce((sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity, 0) || 0;

  if (loading) return <Loading />;
  if (!cart?.items.length) return <div className="container-page py-8"><EmptyState title="Giỏ hàng đang trống" action={<Link href="/products"><Button>Tiếp tục mua sắm</Button></Link>} /></div>;

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Shopping cart</p>
        <h1 className="section-title mt-1">Giỏ hàng của bạn</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdate={async (quantity) => {
                await apiPut(`/cart/items/${item.id}`, { quantity }, session!.accessToken);
                await load();
              }}
              onRemove={async () => {
                await apiDelete(`/cart/items/${item.id}`, session!.accessToken);
                await load();
              }}
            />
          ))}
        </div>
        <aside className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-soft lg:sticky lg:top-24">
          <h2 className="text-lg font-black text-slate-950">Tóm tắt đơn hàng</h2>
          <div className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Số sản phẩm</span>
              <span className="font-bold">{cart.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tạm tính</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-sm font-bold text-slate-500">Tổng tiền</span>
            <p className="text-2xl font-black text-primary-700">{formatCurrency(total)}</p>
          </div>
          <Link href="/checkout"><Button className="mt-5 w-full">Tiến hành thanh toán</Button></Link>
          <Link href="/products" className="mt-3 block text-center text-sm font-bold text-primary-700">Tiếp tục mua sắm</Link>
        </aside>
      </div>
    </div>
  );
}
