"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { apiDelete, apiGet, apiPost, apiPut, getErrorMessage } from "@/lib/api";
import { Address, ApiResponse, User } from "@/types";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState({ label: "Nha", fullName: "", phone: "", address: "", city: "", postalCode: "", country: "Vietnam" });

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
    load().catch((error) => alert(getErrorMessage(error)));
  }, [status, session?.accessToken]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !profile) return;
    const res = await apiPut<ApiResponse<User>>("/users/profile", { name: profile.name, phone: profile.phone }, session.accessToken);
    setProfile(res.data);
    alert("Da cap nhat profile");
  }

  async function addAddress(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return;
    await apiPost("/users/addresses", addressForm, session.accessToken);
    setAddressForm({ label: "Nha", fullName: "", phone: "", address: "", city: "", postalCode: "", country: "Vietnam" });
    await load();
  }

  async function setDefault(id: number) {
    if (!session?.accessToken) return;
    await apiPut(`/users/addresses/${id}/default`, {}, session.accessToken);
    await load();
  }

  async function remove(id: number) {
    if (!session?.accessToken) return;
    await apiDelete(`/users/addresses/${id}`, session.accessToken);
    await load();
  }

  if (!profile) return <Loading />;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-md border bg-white p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-black text-primary-700">
          {profile.name?.[0] || "U"}
        </div>
        <h1 className="mt-4 text-xl font-bold">{profile.name}</h1>
        <p className="text-sm text-slate-500">{profile.email}</p>
      </aside>

      <main className="space-y-6">
        <form onSubmit={saveProfile} className="rounded-md border bg-white p-5">
          <h2 className="text-lg font-bold">Thong tin ca nhan</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Ho ten" />
            <Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="So dien thoai" />
          </div>
          <Button className="mt-4">Luu thay doi</Button>
        </form>

        <section className="rounded-md border bg-white p-5">
          <h2 className="text-lg font-bold">Dia chi giao hang</h2>
          <form onSubmit={addAddress} className="mt-4 grid gap-3 md:grid-cols-2">
            <Input value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="Nhan" />
            <Input value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} placeholder="Nguoi nhan" />
            <Input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="So dien thoai" />
            <Input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="Tinh/Thanh pho" />
            <Input className="md:col-span-2" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} placeholder="Dia chi" />
            <Input value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} placeholder="Ma buu chinh" />
            <Input value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} placeholder="Quoc gia" />
            <Button className="md:col-span-2">Them dia chi</Button>
          </form>
          <div className="mt-5 grid gap-3">
            {addresses.map((item) => (
              <div key={item.id} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.label} {item.isDefault && <span className="text-primary-700">(mac dinh)</span>}</p>
                    <p className="text-sm text-slate-600">{item.fullName} - {item.phone}</p>
                    <p className="text-sm text-slate-600">{item.address}, {item.city}, {item.country}</p>
                  </div>
                  <div className="flex gap-2">
                    {!item.isDefault && <Button variant="secondary" onClick={() => setDefault(item.id)}>Mac dinh</Button>}
                    <Button variant="danger" onClick={() => remove(item.id)}>Xoa</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
