"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  async function load() {
    if (!session?.accessToken) return;
    const res = await apiGet<ApiResponse<Cart>>("/cart", session.accessToken);
    setCart(res.data);
    setLoading(false);
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) load().catch((error) => alert(getErrorMessage(error)));
  }, [status, session]);

  const total = cart?.items.reduce((sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity, 0) || 0;

  if (loading) return <Loading />;
  if (!cart?.items.length) return <div className="mx-auto max-w-4xl px-4 py-8"><EmptyState title="Giỏ hàng đang trống" action={<Link href="/products"><Button>Tiếp tục mua sắm</Button></Link>} /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-5 text-2xl font-bold">Giỏ hàng</h1>
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
      <div className="mt-5 flex items-center justify-between rounded-md border bg-white p-4">
        <span className="text-lg font-bold">Tổng tiền</span>
        <div className="text-right">
          <p className="text-2xl font-black text-primary-700">{formatCurrency(total)}</p>
          <Link href="/checkout"><Button className="mt-3">Checkout</Button></Link>
        </div>
      </div>
    </div>
  );
}
