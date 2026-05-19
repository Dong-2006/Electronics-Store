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
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="space-y-4 rounded-md border bg-white p-5">
        <h1 className="text-2xl font-bold">Thong tin nhan hang</h1>
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
            <option value="">Chon dia chi da luu</option>
            {addresses.map((item) => <option key={item.id} value={item.id}>{item.label} - {item.address}</option>)}
          </Select>
        )}
        <Input required placeholder="Ho ten" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input required placeholder="So dien thoai" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input required placeholder="Dia chi" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Input placeholder="Ghi chu" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
          <option value="COD">Thanh toan khi nhan hang</option>
          <option value="BANK_TRANSFER">Chuyen khoan ngan hang</option>
          <option value="VNPAY">VNPAY</option>
          <option value="MOMO">MoMo</option>
        </Select>
        <Button type="submit" disabled={!cart?.items.length}>Dat hang</Button>
      </form>
      <aside className="rounded-md border bg-white p-5">
        <h2 className="mb-3 text-lg font-bold">Don hang</h2>
        <div className="space-y-3">
          {cart?.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <span>{item.product.name} x {item.quantity}</span>
              <span className="font-semibold">{formatCurrency(Number(item.product.discountPrice || item.product.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        {!!sellerIds.length && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <p className="text-sm font-semibold">Voucher theo shop</p>
            {sellerIds.map((sellerId) => (
              <Input
                key={sellerId}
                value={vouchers[sellerId] || ""}
                onChange={(e) => setVouchers({ ...vouchers, [sellerId]: e.target.value })}
                placeholder={`Ma voucher shop #${sellerId}`}
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
          <span>Tong</span>
          <span className="text-primary-700">{formatCurrency(total)}</span>
        </div>
      </aside>
    </div>
  );
}
