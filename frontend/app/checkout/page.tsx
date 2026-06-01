"use client";

import { CheckCircle2, CreditCard, MapPin, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AddressCard } from "@/components/common/AddressCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { PaymentMethodCard } from "@/components/common/PaymentMethodCard";
import { Textarea } from "@/components/common/Textarea";
import { useToast } from "@/components/common/Toast";
import { VoucherInput } from "@/components/common/VoucherInput";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Address, ApiResponse, Cart, Order, PaymentMethod } from "@/types";

const steps = [
  { id: 1, label: "Địa chỉ giao hàng", icon: MapPin },
  { id: 2, label: "Thanh toán & voucher", icon: CreditCard },
  { id: 3, label: "Xác nhận", icon: CheckCircle2 }
];
const paymentMethods: PaymentMethod[] = ["COD", "BANK_TRANSFER", "VNPAY", "MOMO"];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", note: "", paymentMethod: "COD" as PaymentMethod });
  const [vouchers, setVouchers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

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
        const defaultAddress = addressRes.data.find((item) => item.isDefault) || addressRes.data[0];
        if (defaultAddress) {
          selectAddress(defaultAddress);
        }
      })
      .catch((error) => toast({ title: "Không tải được dữ liệu checkout", description: getErrorMessage(error), variant: "error" }))
      .finally(() => setLoading(false));
  }, [status, session?.accessToken, router, toast]);

  function selectAddress(address: Address) {
    setSelectedAddressId(address.id);
    setForm((current) => ({
      ...current,
      fullName: address.fullName,
      phone: address.phone,
      address: `${address.address}, ${address.city}, ${address.country}`
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.fullName || !form.phone || !form.address) {
      toast({ title: "Thiếu thông tin giao hàng", description: "Vui lòng nhập đủ họ tên, điện thoại và địa chỉ.", variant: "warning" });
      setStep(1);
      return;
    }

    setSubmitting(true);
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
      toast({ title: "Đặt hàng thành công", description: `Đơn hàng #${res.data.id} đã được tạo.`, variant: "success" });
      router.push(`/orders/${res.data.id}`);
    } catch (error) {
      toast({ title: "Không thể đặt hàng", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;
  if (!cart?.items.length) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: "Thanh toán" }]} />
        <EmptyState
          title="Không có sản phẩm để thanh toán"
          description="Giỏ hàng đang trống. Hãy thêm sản phẩm trước khi quay lại checkout."
          action={<Button onClick={() => router.push("/products")}>Tiếp tục mua sắm</Button>}
          icon={<ShoppingBag className="h-7 w-7" />}
        />
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity, 0);
  const sellerIds = Array.from(new Set(cart.items.map((item) => item.product.sellerId).filter(Boolean))) as number[];

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Giỏ hàng", href: "/cart" }, { label: "Thanh toán" }]} />
      <div className="mb-6">
        <p className="muted-label text-primary-700">Checkout</p>
        <h1 className="section-title mt-1">Thanh toán đơn hàng</h1>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {steps.map((item) => {
          const Icon = item.icon;
          const active = step === item.id;
          const done = step > item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
              className={active || done ? "flex items-center gap-3 rounded-md border border-primary-200 bg-primary-50 p-4 text-left text-primary-800 shadow-sm" : "flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-left text-slate-500 shadow-sm"}
            >
              <span className={active || done ? "grid h-10 w-10 place-items-center rounded-md bg-primary-600 text-white" : "grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-slate-500"}>
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide">Bước {item.id}</span>
                <span className="font-black">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader title="Địa chỉ giao hàng" description="Chọn địa chỉ đã lưu hoặc nhập địa chỉ mới cho đơn hàng này." />
              <CardContent className="space-y-5">
                {!!addresses.length && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {addresses.map((address) => (
                      <AddressCard key={address.id} address={address} selected={selectedAddressId === address.id} onSelect={() => selectAddress(address)} />
                    ))}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Họ tên người nhận">
                    <Input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
                  </FormField>
                  <FormField label="Số điện thoại">
                    <Input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                  </FormField>
                  <FormField label="Địa chỉ" className="md:col-span-2">
                    <Input required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
                  </FormField>
                  <FormField label="Ghi chú" className="md:col-span-2" helper="Tùy chọn, ví dụ: giao giờ hành chính.">
                    <Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
                  </FormField>
                </div>
                <Button type="button" onClick={() => setStep(2)}>Tiếp tục</Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader title="Thanh toán & voucher" description="Chọn phương thức thanh toán và nhập voucher theo từng shop nếu có." />
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method}
                      method={method}
                      selected={form.paymentMethod === method}
                      onSelect={() => setForm({ ...form, paymentMethod: method })}
                    />
                  ))}
                </div>
                {!!sellerIds.length && (
                  <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 font-black text-slate-950">Voucher theo shop</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {sellerIds.map((sellerId) => (
                        <VoucherInput
                          key={sellerId}
                          value={vouchers[sellerId] || ""}
                          onChange={(value) => setVouchers({ ...vouchers, [sellerId]: value })}
                          placeholder={`Mã voucher shop #${sellerId}`}
                          helper="Backend sẽ kiểm tra mã khi đặt hàng."
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)}>Quay lại</Button>
                  <Button type="button" onClick={() => setStep(3)}>Tiếp tục</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader title="Xác nhận đơn hàng" description="Kiểm tra lại thông tin trước khi đặt hàng." />
              <CardContent className="space-y-4">
                <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <p><b>Người nhận:</b> {form.fullName}</p>
                  <p><b>Điện thoại:</b> {form.phone}</p>
                  <p><b>Địa chỉ:</b> {form.address}</p>
                  <p><b>Thanh toán:</b> {form.paymentMethod}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)}>Quay lại</Button>
                  <Button type="submit" isLoading={submitting} loadingText="Đang đặt hàng">Đặt hàng</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Đơn hàng" description={`${cart.items.length} sản phẩm trong giỏ`} />
            <CardContent>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 rounded-md bg-slate-50 p-3 text-sm">
                    <span className="line-clamp-2 text-slate-600">{item.product.name} x {item.quantity}</span>
                    <span className="shrink-0 font-bold">{formatCurrency(Number(item.product.discountPrice || item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-lg font-black">
                <span>Tổng</span>
                <span className="text-primary-700">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}
