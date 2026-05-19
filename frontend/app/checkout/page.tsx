"use client";

import { CreditCard, MapPin, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { Select } from "@/components/common/Select";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Address, ApiResponse, Cart, Order } from "@/types";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", note: "", paymentMethod: "COD" });
  const [vouchers, setVouchers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (!session?.accessToken) return;

    Promise.all([
      apiGet<ApiResponse<Cart>>("/cart", session.accessToken),
      apiGet<ApiResponse<Address[]>>("/users/addresses", session.accessToken)
    ])
      .then(([cartRes, addressRes]) => {
        setCart(cartRes.data);
        setAddresses(addressRes.data);
        const defaultAddress = addressRes.data.find((item) => item.isDefault);
        if (defaultAddress) {
          setForm((current) => ({
            ...current,
            fullName: defaultAddress.fullName,
            phone: defaultAddress.phone,
            address: `${defaultAddress.address}, ${defaultAddress.city}, ${defaultAddress.country}`
          }));
        }
      })
      .catch((error) => alert(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [status, session, router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const res = await apiPost<ApiResponse<Order>>(
        "/orders",
        {
          ...form,
          vouchers: Object.entries(vouchers)
            .filter(([, code]) => code.trim())
            .map(([sellerId, code]) => ({ sellerId: Number(sellerId), code }))
        },
        session!.accessToken
      );
      router.push(`/orders/${res.data.id}`);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  if (loading) return <Loading />;
  const total = cart?.items.reduce((sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity, 0) || 0;
  const sellerIds = Array.from(new Set((cart?.items || []).map((item) => item.product.sellerId).filter(Boolean))) as number[];

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Checkout</p>
        <h1 className="section-title mt-1">Thanh toán đơn hàng</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-5 rounded-md border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-50 text-primary-700"><MapPin className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-black text-slate-950">Thông tin nhận hàng</h2>
              <p className="text-sm text-slate-500">Dùng địa chỉ đã lưu hoặc nhập địa chỉ mới.</p>
            </div>
          </div>
          {!!addresses.length && (
            <Select
              defaultValue=""
              onChange={(e) => {
                const address = addresses.find((item) => item.id === Number(e.target.value));
                if (address) {
                  setForm({
                    ...form,
                    fullName: address.fullName,
                    phone: address.phone,
                    address: `${address.address}, ${address.city}, ${address.country}`
                  });
                }
              }}
            >
              <option value="">Chọn địa chỉ đã lưu</option>
              {addresses.map((item) => <option key={item.id} value={item.id}>{item.label} - {item.address}</option>)}
            </Select>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Input required placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <Input required placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input required placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input placeholder="Ghi chú" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-50 text-primary-700"><CreditCard className="h-5 w-5" /></span>
            <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="COD">Thanh toán khi nhận hàng</option>
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="VNPAY">VNPAY</option>
              <option value="MOMO">MoMo</option>
            </Select>
          </div>
          <Button className="w-full" type="submit" disabled={!cart?.items.length}>Đặt hàng</Button>
        </form>

        <aside className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-soft lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-50 text-primary-700"><ShoppingBag className="h-5 w-5" /></span>
            <h2 className="text-lg font-black text-slate-950">Đơn hàng</h2>
          </div>
          <div className="mt-4 space-y-3">
            {cart?.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="line-clamp-2 text-slate-600">{item.product.name} x {item.quantity}</span>
                <span className="shrink-0 font-bold">{formatCurrency(Number(item.product.discountPrice || item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          {!!sellerIds.length && (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <p className="text-sm font-bold text-slate-700">Voucher theo shop</p>
              {sellerIds.map((sellerId) => (
                <Input
                  key={sellerId}
                  value={vouchers[sellerId] || ""}
                  onChange={(e) => setVouchers({ ...vouchers, [sellerId]: e.target.value })}
                  placeholder={`Mã voucher shop #${sellerId}`}
                />
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-lg font-black">
            <span>Tổng</span>
            <span className="text-primary-700">{formatCurrency(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
