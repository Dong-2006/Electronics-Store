"use client";

import { LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Email hoặc mật khẩu không đúng");
    else router.push("/");
  }

  return (
    <div className="container-page grid min-h-[calc(100vh-5rem)] place-items-center py-10">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-lift">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Welcome back</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-500">Truy cập giỏ hàng, đơn hàng, dashboard seller hoặc admin.</p>
        </div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <label className="block space-y-1">
          <span className="text-sm font-bold text-slate-700">Email</span>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input className="pl-10" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input className="pl-10" type="password" required placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </label>
        <Button className="w-full" type="submit">Đăng nhập</Button>
        <p className="text-center text-sm text-slate-500">Chưa có tài khoản? <Link className="font-bold text-primary-700" href="/register">Đăng ký</Link></p>
      </form>
    </div>
  );
}
