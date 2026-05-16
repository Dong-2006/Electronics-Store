"use client";

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
    <div className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={submit} className="space-y-4 rounded-md border bg-white p-6">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button className="w-full" type="submit">Đăng nhập</Button>
        <p className="text-center text-sm text-slate-500">Chưa có tài khoản? <Link className="font-semibold text-primary-700" href="/register">Đăng ký</Link></p>
      </form>
    </div>
  );
}
