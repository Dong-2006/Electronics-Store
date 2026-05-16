"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { Select } from "@/components/common/Select";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Cart, Order } from "@/types";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", note: "", paymentMethod: "COD" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      apiGet<ApiResponse<Cart>>("/cart", session.accessToken)
        .then((res) => setCart(res.data))
        .catch((error) => alert(getErrorMessage(error)))
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const res = await apiPost<ApiResponse<Order>>("/orders", form, session!.accessToken);
      router.push(`/orders/${res.data.id}`);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  if (loading) return <Loading />;
  const total = cart?.items.reduce((sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity, 0) || 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="space-y-4 rounded-md border bg-white p-5">
        <h1 className="text-2xl font-bold">Thông tin nhận hàng</h1>
        <Input required placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input required placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input required placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Input placeholder="Ghi chú" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
          <option value="COD">Thanh toán khi nhận hàng</option>
          <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
        </Select>
        <Button type="submit" disabled={!cart?.items.length}>Đặt hàng</Button>
      </form>
      <aside className="rounded-md border bg-white p-5">
        <h2 className="mb-3 text-lg font-bold">Đơn hàng</h2>
        <div className="space-y-3">
          {cart?.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <span>{item.product.name} x {item.quantity}</span>
              <span className="font-semibold">{formatCurrency(Number(item.product.discountPrice || item.product.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
          <span>Tổng</span>
          <span className="text-primary-700">{formatCurrency(total)}</span>
        </div>
      </aside>
    </div>
  );
}
