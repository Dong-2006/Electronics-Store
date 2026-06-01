"use client";

import { LockKeyhole, MapPin, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Address, ApiResponse, User } from "@/types";

type Tab = "profile" | "addresses" | "security";

const emptyAddress = { label: "Nhà", fullName: "", phone: "", address: "", city: "", postalCode: "", country: "Việt Nam" };

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tab, setTab] = useState<Tab>("profile");
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  async function load() {
    if (!session?.accessToken) return;
    const [profileRes, addressRes] = await Promise.all([
      apiGet<ApiResponse<User>>("/users/profile", session.accessToken),
      apiGet<ApiResponse<Address[]>>("/users/addresses", session.accessToken)
    ]);
    setProfile(profileRes.data);
    setAddresses(addressRes.data);
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      load().catch((error) => toast({ title: "Không tải được hồ sơ", description: getErrorMessage(error), variant: "error" }));
    }
  }, [status, session?.accessToken]);

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

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Tài khoản" }]} />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardContent>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-black text-primary-700">
                {profile.name?.[0] || "U"}
              </div>
              <h1 className="mt-4 text-xl font-black text-slate-950">{profile.name}</h1>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </CardContent>
          </Card>
          <nav className="grid gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
            {[
              { id: "profile", label: "Hồ sơ", icon: UserRound },
              { id: "addresses", label: "Địa chỉ", icon: MapPin },
              { id: "security", label: "Bảo mật", icon: LockKeyhole }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as Tab)}
                  className={tab === item.id ? "flex items-center gap-2 rounded-md bg-primary-50 px-3 py-2 text-sm font-bold text-primary-700" : "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main>
          {tab === "profile" && (
            <Card>
              <CardHeader title="Thông tin cá nhân" description="Cập nhật tên hiển thị và số điện thoại liên hệ." />
              <CardContent>
                <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
                  <FormField label="Họ tên">
                    <Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
                  </FormField>
                  <FormField label="Số điện thoại">
                    <Input value={profile.phone || ""} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                  </FormField>
                  <Button className="md:col-span-2 md:w-fit" isLoading={saving} loadingText="Đang lưu">Lưu thay đổi</Button>
                </form>
              </CardContent>
            </Card>
          )}

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
                  <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">Bạn chưa lưu địa chỉ nào.</p>
                )}
              </CardContent>
            </Card>
          )}

          {tab === "security" && (
            <Card>
              <CardHeader title="Bảo mật" description="Đổi mật khẩu tài khoản." />
              <CardContent>
                <form onSubmit={changePassword} className="grid gap-4 md:max-w-xl">
                  <FormField label="Mật khẩu hiện tại">
                    <Input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />
                  </FormField>
                  <FormField label="Mật khẩu mới" helper="Tối thiểu 6 ký tự.">
                    <Input type="password" minLength={6} value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
                  </FormField>
                  <Button className="w-fit" isLoading={saving} loadingText="Đang đổi">Đổi mật khẩu</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <Modal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Thêm địa chỉ giao hàng"
        description="Địa chỉ đầu tiên sẽ tự động trở thành mặc định."
      >
        <form onSubmit={addAddress} className="grid gap-4 md:grid-cols-2">
          <FormField label="Nhãn"><Input value={addressForm.label} onChange={(event) => setAddressForm({ ...addressForm, label: event.target.value })} /></FormField>
          <FormField label="Người nhận"><Input required value={addressForm.fullName} onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} /></FormField>
          <FormField label="Số điện thoại"><Input required value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} /></FormField>
          <FormField label="Tỉnh/Thành phố"><Input required value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} /></FormField>
          <FormField label="Địa chỉ" className="md:col-span-2"><Input required value={addressForm.address} onChange={(event) => setAddressForm({ ...addressForm, address: event.target.value })} /></FormField>
          <FormField label="Mã bưu chính"><Input value={addressForm.postalCode} onChange={(event) => setAddressForm({ ...addressForm, postalCode: event.target.value })} /></FormField>
          <FormField label="Quốc gia"><Input value={addressForm.country} onChange={(event) => setAddressForm({ ...addressForm, country: event.target.value })} /></FormField>
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
