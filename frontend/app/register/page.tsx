"use client";

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
    <div className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={submit} className="space-y-4 rounded-md border bg-white p-6">
        <h1 className="text-2xl font-bold">Đăng ký</h1>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Input required placeholder="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input type="password" required minLength={6} placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button className="w-full" type="submit">Tạo tài khoản</Button>
        <p className="text-center text-sm text-slate-500">Đã có tài khoản? <Link className="font-semibold text-primary-700" href="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}
