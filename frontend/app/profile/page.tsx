"use client";

import { CheckCircle2, Circle, Clock, LockKeyhole, MapPin, Package, ShoppingBag, Truck, UserRound, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { AddressCard } from "@/components/common/AddressCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { Modal } from "@/components/common/Modal";
import { useToast } from "@/components/common/Toast";
import { apiDelete, apiGet, apiPost, apiPut, getErrorMessage } from "@/lib/api";
import { Address, ApiResponse, Order, OrderStatus, User } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { getProductImage } from "@/lib/product-images";

type Tab = "profile" | "orders" | "addresses" | "security";

const emptyAddress = { label: "Nhà", fullName: "", phone: "", address: "", city: "", postalCode: "", country: "Việt Nam" };

// ─── Order status config ──────────────────────────────────────────────────────
const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "PENDING",   label: "Chờ xác nhận", icon: Clock },
  { status: "CONFIRMED", label: "Đã xác nhận",  icon: CheckCircle2 },
  { status: "SHIPPING",  label: "Đang giao",     icon: Truck },
  { status: "DELIVERED", label: "Đã nhận",       icon: Package },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING:          "text-amber-600  bg-amber-50  border-amber-200",
  CONFIRMED:        "text-blue-600   bg-blue-50   border-blue-200",
  SHIPPING:         "text-violet-600 bg-violet-50 border-violet-200",
  SHIPPED:          "text-indigo-600 bg-indigo-50 border-indigo-200",
  DELIVERED:        "text-emerald-600 bg-emerald-50 border-emerald-200",
  CANCELLED:        "text-red-600    bg-red-50    border-red-200",
  REFUND_REQUESTED: "text-orange-600 bg-orange-50 border-orange-200",
};

function getStepIndex(status: OrderStatus) {
  const map: Record<OrderStatus, number> = {
    PENDING: 0, CONFIRMED: 1, SHIPPING: 2, SHIPPED: 2, DELIVERED: 3,
    CANCELLED: -1, REFUND_REQUESTED: -1
  };
  return map[status] ?? 0;
}

// ─── Order progress tracker component ────────────────────────────────────────
function OrderProgress({ status }: { status: OrderStatus }) {
  const isCancelled = status === "CANCELLED" || status === "REFUND_REQUESTED";
  const currentStep = getStepIndex(status);

  if (isCancelled) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
        <span className="text-sm font-semibold text-red-600">
          {status === "CANCELLED" ? "Đơn hàng đã bị hủy" : "Đang xử lý hoàn tiền"}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-start">
        {ORDER_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = idx < currentStep;
          const active = idx === currentStep;
          const last = idx === ORDER_STEPS.length - 1;
          return (
            <div key={step.status} className="flex flex-1 flex-col items-center">
              {/* connector + dot row */}
              <div className="flex w-full items-center">
                {/* left connector */}
                <div className={`h-0.5 flex-1 transition-colors ${idx === 0 ? "invisible" : done || active ? "bg-blue-500" : "bg-slate-200"}`} />
                {/* circle */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    done
                      ? "border-blue-500 bg-blue-500 text-white"
                      : active
                      ? "border-blue-500 bg-white text-blue-600 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  {active && (
                    <span className="absolute -inset-1 animate-ping rounded-full bg-blue-400/20" />
                  )}
                </div>
                {/* right connector */}
                <div className={`h-0.5 flex-1 transition-colors ${last ? "invisible" : done ? "bg-blue-500" : "bg-slate-200"}`} />
              </div>
              {/* label */}
              <p className={`mt-2 text-center text-[11px] font-semibold leading-tight ${active ? "text-blue-600" : done ? "text-slate-700" : "text-slate-400"}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Single order card in profile ────────────────────────────────────────────
function ProfileOrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = STATUS_COLOR[order.status] || STATUS_COLOR.PENDING;
  const firstThreeItems = order.items?.slice(0, 3) ?? [];
  const extraCount = (order.items?.length ?? 0) - 3;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-shadow hover:shadow-lift">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50">
            <ShoppingBag className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Đơn hàng #{order.id}</p>
            <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-lg border px-3 py-1 text-xs font-bold ${colorClass}`}>
            {order.status === "PENDING" ? "Chờ xác nhận"
              : order.status === "CONFIRMED" ? "Đã xác nhận"
              : order.status === "SHIPPING" ? "Đang giao"
              : order.status === "SHIPPED" ? "Đã gửi hàng"
              : order.status === "DELIVERED" ? "Đã nhận hàng"
              : order.status === "CANCELLED" ? "Đã hủy"
              : "Hoàn tiền"}
          </span>
          <span className="text-sm font-black text-slate-900">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="px-5 pb-4 pt-3">
        <OrderProgress status={order.status} />
      </div>

      {/* Product thumbnails */}
      {firstThreeItems.length > 0 && (
        <div className="border-t border-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            {firstThreeItems.map((item) => (
              <div key={item.id} className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <Image
                  src={getProductImage(item.product)}
                  alt={item.product.name}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
            ))}
            {extraCount > 0 && (
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-500">
                +{extraCount}
              </div>
            )}
            <span className="ml-auto text-xs text-slate-500">{order.items?.length ?? 0} sản phẩm</span>
          </div>
        </div>
      )}

      {/* Expand / collapse sub-orders */}
      {(order.subOrders?.length ?? 0) > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between border-t border-slate-100 px-5 py-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            <span>{expanded ? "Ẩn tiến trình giao hàng" : "Xem tiến trình giao hàng theo shop"}</span>
            <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
          </button>

          {expanded && (
            <div className="divide-y divide-slate-50 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              {order.subOrders!.map((sub) => (
                <div key={sub.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-700">
                      {sub.seller?.shopName ?? `Shop #${sub.sellerId}`}
                    </p>
                    <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${STATUS_COLOR[sub.status] ?? STATUS_COLOR.PENDING}`}>
                      {sub.status}
                    </span>
                  </div>
                  {sub.trackingNumber && (
                    <p className="mt-1 text-[11px] text-slate-500">Mã vận đơn: <span className="font-semibold text-slate-700">{sub.trackingNumber}</span></p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sub.items.slice(0, 4).map((item) => (
                      <span key={item.id} className="truncate rounded-lg bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-100">
                        {item.product.name} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer action */}
      <div className="border-t border-slate-100 px-5 py-3">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-800"
        >
          Xem chi tiết đơn hàng
          <span className="text-base leading-none">→</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Main profile page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>("profile");
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [ordersLoading, setOrdersLoading] = useState(false);

  async function load() {
    if (!session?.accessToken) return;
    const [profileRes, addressRes] = await Promise.all([
      apiGet<ApiResponse<User>>("/users/profile", session.accessToken),
      apiGet<ApiResponse<Address[]>>("/users/addresses", session.accessToken)
    ]);
    setProfile(profileRes.data);
    setAddresses(addressRes.data);
  }

  async function loadOrders() {
    if (!session?.accessToken) return;
    setOrdersLoading(true);
    try {
      const res = await apiGet<ApiResponse<Order[]>>("/orders/my-orders", session.accessToken);
      setOrders(res.data);
    } catch (error) {
      toast({ title: "Không tải được đơn hàng", description: getErrorMessage(error), variant: "error" });
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      load().catch((error) =>
        toast({ title: "Không tải được hồ sơ", description: getErrorMessage(error), variant: "error" })
      );
    }
  }, [status, session?.accessToken]);

  // Lazy-load orders khi user chuyển sang tab orders
  useEffect(() => {
    if (tab === "orders" && orders.length === 0) {
      loadOrders();
    }
  }, [tab]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !profile) return;
    setSaving(true);
    try {
      const res = await apiPut<ApiResponse<User>>("/users/profile", { name: profile.name, phone: profile.phone }, session.accessToken);
      setProfile(res.data);
      toast({ title: "Đã cập nhật hồ sơ", variant: "success" });
    } catch (error) {
      toast({ title: "Không thể cập nhật hồ sơ", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function addAddress(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      await apiPost("/users/addresses", addressForm, session.accessToken);
      setAddressForm(emptyAddress);
      setAddressModalOpen(false);
      toast({ title: "Đã thêm địa chỉ", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể thêm địa chỉ", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: number) {
    if (!session?.accessToken) return;
    try {
      await apiPut(`/users/addresses/${id}/default`, {}, session.accessToken);
      await load();
    } catch (error) {
      toast({ title: "Không thể đặt mặc định", description: getErrorMessage(error), variant: "error" });
    }
  }

  async function removeAddress() {
    if (!session?.accessToken || !deleteAddressId) return;
    setSaving(true);
    try {
      await apiDelete(`/users/addresses/${deleteAddressId}`, session.accessToken);
      setDeleteAddressId(null);
      toast({ title: "Đã xóa địa chỉ", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể xóa địa chỉ", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      await apiPut("/users/change-password", passwordForm, session.accessToken);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast({ title: "Đã đổi mật khẩu", variant: "success" });
    } catch (error) {
      toast({ title: "Không thể đổi mật khẩu", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <Loading />;

  const navItems = [
    { id: "profile",   label: "Hồ sơ",    icon: UserRound },
    { id: "orders",    label: "Đơn hàng",  icon: ShoppingBag },
    { id: "addresses", label: "Địa chỉ",   icon: MapPin },
    { id: "security",  label: "Bảo mật",   icon: LockKeyhole },
  ];

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Tài khoản" }]} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

        {/* ── Sidebar ── */}
        <aside className="space-y-4">
          {/* Avatar card */}
          <Card>
            <CardContent>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-500/25">
                {profile.name?.[0]?.toUpperCase() || "U"}
              </div>
              <h1 className="mt-4 text-xl font-black text-slate-900">{profile.name}</h1>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </CardContent>
          </Card>

          {/* Nav */}
          <nav className="grid gap-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-card">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as Tab)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                  {item.label}
                  {item.id === "orders" && orders.length > 0 && (
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {orders.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0">

          {/* Profile tab */}
          {tab === "profile" && (
            <Card>
              <CardHeader title="Thông tin cá nhân" description="Cập nhật tên hiển thị và số điện thoại liên hệ." />
              <CardContent>
                <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
                  <FormField label="Họ tên">
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </FormField>
                  <FormField label="Số điện thoại">
                    <Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </FormField>
                  <Button className="md:col-span-2 md:w-fit" isLoading={saving} loadingText="Đang lưu">Lưu thay đổi</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Orders tab */}
          {tab === "orders" && (
            <div>
              <div className="mb-6">
                <p className="muted-label text-blue-600">Lịch sử mua hàng</p>
                <h2 className="section-title mt-1">Đơn hàng của bạn</h2>
              </div>

              {ordersLoading ? (
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : orders.length ? (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <ProfileOrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                  <ShoppingBag className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="font-bold text-slate-600">Bạn chưa có đơn hàng nào</p>
                  <p className="mt-1 text-sm text-slate-400">Mua sắm ngay để theo dõi đơn hàng tại đây!</p>
                  <Link href="/products" className="mt-5">
                    <Button>Khám phá sản phẩm</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Addresses tab */}
          {tab === "addresses" && (
            <Card>
              <CardHeader
                title="Địa chỉ giao hàng"
                description="Quản lý các địa chỉ dùng cho checkout."
                action={<Button onClick={() => setAddressModalOpen(true)}>Thêm địa chỉ</Button>}
              />
              <CardContent>
                {addresses.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {addresses.map((item) => (
                      <AddressCard
                        key={item.id}
                        address={item}
                        onDefault={() => setDefault(item.id)}
                        onDelete={() => setDeleteAddressId(item.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Bạn chưa lưu địa chỉ nào.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security tab */}
          {tab === "security" && (
            <Card>
              <CardHeader title="Bảo mật" description="Đổi mật khẩu tài khoản." />
              <CardContent>
                <form onSubmit={changePassword} className="grid gap-4 md:max-w-xl">
                  <FormField label="Mật khẩu hiện tại">
                    <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                  </FormField>
                  <FormField label="Mật khẩu mới" helper="Tối thiểu 6 ký tự.">
                    <Input type="password" minLength={6} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                  </FormField>
                  <Button className="w-fit" isLoading={saving} loadingText="Đang đổi">Đổi mật khẩu</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Modals */}
      <Modal open={addressModalOpen} onClose={() => setAddressModalOpen(false)} title="Thêm địa chỉ giao hàng" description="Địa chỉ đầu tiên sẽ tự động trở thành mặc định.">
        <form onSubmit={addAddress} className="grid gap-4 md:grid-cols-2">
          <FormField label="Nhãn"><Input value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} /></FormField>
          <FormField label="Người nhận"><Input required value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} /></FormField>
          <FormField label="Số điện thoại"><Input required value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} /></FormField>
          <FormField label="Tỉnh/Thành phố"><Input required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} /></FormField>
          <FormField label="Địa chỉ" className="md:col-span-2"><Input required value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} /></FormField>
          <FormField label="Mã bưu chính"><Input value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} /></FormField>
          <FormField label="Quốc gia"><Input value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} /></FormField>
          <Button className="md:col-span-2" isLoading={saving} loadingText="Đang thêm">Thêm địa chỉ</Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteAddressId !== null}
        title="Xóa địa chỉ?"
        description="Địa chỉ này sẽ bị xóa khỏi sổ địa chỉ của bạn."
        confirmLabel="Xóa địa chỉ"
        isLoading={saving}
        onClose={() => setDeleteAddressId(null)}
        onConfirm={removeAddress}
      />
    </div>
  );
}
