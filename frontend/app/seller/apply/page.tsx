"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { ApiResponse, SellerProfile } from "@/types";

const emptyForm = {
  shopName: "",
  shopDescription: "",
  shopLogo: "",
  shopBanner: "",
  businessPhone: "",
  businessEmail: "",
  pickupAddress: ""
};

export default function SellerApplyPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!session?.accessToken) return;
    const res = await apiGet<ApiResponse<SellerProfile | null>>("/seller/me", session.accessToken);
    setProfile(res.data);
    if (res.data) {
      setForm({
        shopName: res.data.shopName,
        shopDescription: res.data.shopDescription || "",
        shopLogo: res.data.shopLogo || "",
        shopBanner: res.data.shopBanner || "",
        businessPhone: res.data.businessPhone,
        businessEmail: res.data.businessEmail,
        pickupAddress: res.data.pickupAddress
      });
    }
  }

  useEffect(() => {
    if (status === "authenticated") load().catch((error) => alert(getErrorMessage(error))).finally(() => setLoading(false));
    if (status === "unauthenticated") setLoading(false);
  }, [status]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return alert("Vui long dang nhap de dang ky seller");
    try {
      const res = await apiPost<ApiResponse<SellerProfile>>("/seller/apply", form, session.accessToken);
      setProfile(res.data);
      alert("Yeu cau seller da duoc gui cho admin duyet.");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  if (loading || status === "loading") return <Loading />;
  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Dang ky tro thanh seller</h1>
        <p className="mt-2 text-slate-600">Ban can dang nhap de gui yeu cau mo shop.</p>
        <Link className="mt-4 inline-block" href="/login"><Button>Dang nhap</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dang ky tro thanh seller</h1>
          <p className="mt-1 text-sm text-slate-500">Gui thong tin shop de admin xet duyet.</p>
        </div>
        {profile && <StatusBadge status={profile.status} />}
      </div>

      {profile?.status === "APPROVED" && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-800">Shop da duoc duyet.</p>
          <Link href="/seller/dashboard" className="mt-3 inline-block"><Button>Vao Seller Dashboard</Button></Link>
        </div>
      )}
      {profile?.status === "PENDING" && <p className="mb-4 rounded-md border bg-amber-50 p-4 text-amber-800">Yeu cau dang cho admin duyet.</p>}
      {profile?.status === "REJECTED" && <p className="mb-4 rounded-md border bg-red-50 p-4 text-red-800">Bi tu choi: {profile.rejectReason || "Chua co ly do"}. Ban co the cap nhat va gui lai.</p>}
      {profile?.status === "SUSPENDED" && <p className="mb-4 rounded-md border bg-rose-50 p-4 text-rose-900">Shop dang bi tam khoa.</p>}

      {(profile?.status !== "APPROVED" && profile?.status !== "SUSPENDED") && (
        <form onSubmit={submit} className="grid gap-3 rounded-md border bg-white p-4">
          <Input required placeholder="Ten shop" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
          <textarea required className="min-h-24 rounded-md border border-slate-300 p-3 text-sm" placeholder="Mo ta shop" value={form.shopDescription} onChange={(e) => setForm({ ...form, shopDescription: e.target.value })} />
          <Input placeholder="Logo shop URL" value={form.shopLogo} onChange={(e) => setForm({ ...form, shopLogo: e.target.value })} />
          <Input placeholder="Banner shop URL" value={form.shopBanner} onChange={(e) => setForm({ ...form, shopBanner: e.target.value })} />
          <Input required placeholder="So dien thoai kinh doanh" value={form.businessPhone} onChange={(e) => setForm({ ...form, businessPhone: e.target.value })} />
          <Input required type="email" placeholder="Email kinh doanh" value={form.businessEmail} onChange={(e) => setForm({ ...form, businessEmail: e.target.value })} />
          <textarea required className="min-h-20 rounded-md border border-slate-300 p-3 text-sm" placeholder="Dia chi lay hang" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} />
          <Button type="submit">Gui yeu cau</Button>
        </form>
      )}
    </div>
  );
}
