"use client";

import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { apiPost, getErrorMessage } from "@/lib/api";
import { ApiResponse } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await apiPost<ApiResponse<unknown>>("/auth/register", form);
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="container-page grid min-h-[calc(100vh-5rem)] place-items-center py-10">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-lift">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Tạo tài khoản</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Đăng ký</h1>
          <p className="mt-2 text-sm text-slate-500">Lưu địa chỉ, theo dõi đơn hàng và đánh giá sản phẩm đã mua.</p>
        </div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="relative">
          <UserRound className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <Input className="pl-10" required placeholder="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <Input className="pl-10" type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <Input className="pl-10" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <Input className="pl-10" type="password" required minLength={6} placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Button className="w-full" type="submit">Tạo tài khoản</Button>
        <p className="text-center text-sm text-slate-500">Đã có tài khoản? <Link className="font-bold text-primary-700" href="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}
