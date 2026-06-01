"use client";

import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { FormField } from "@/components/common/FormField";
import { IconButton } from "@/components/common/IconButton";
import { Input } from "@/components/common/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);
    if (res?.error) setError("Email hoặc mật khẩu không đúng.");
    else router.push("/");
  }

  return (
    <div className="container-page grid min-h-[calc(100vh-5rem)] gap-8 py-10 lg:grid-cols-[1fr_460px] lg:items-center">
      <section className="overflow-hidden rounded-md bg-slate-950 p-8 text-white shadow-lift">
        <div className="max-w-xl">
          <p className="muted-label text-cyan-200">ElectroHub account</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Đăng nhập để tiếp tục mua sắm thông minh.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Theo dõi đơn hàng, lưu wishlist, quản lý địa chỉ và truy cập seller/admin center trong cùng một tài khoản.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: ShoppingBag, title: "Giỏ hàng" },
            { icon: Store, title: "Seller center" },
            { icon: ShieldCheck, title: "Bảo mật" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-md border border-white/10 bg-white/10 p-4">
                <Icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 font-bold">{item.title}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Card>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <p className="muted-label text-primary-700">Welcome back</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">Đăng nhập</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Nhập thông tin tài khoản ElectroHub của bạn.</p>
            </div>
            {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <FormField label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10" type="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </FormField>
            <FormField label="Mật khẩu">
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10 pr-12" type={showPassword ? "text" : "password"} required placeholder="Mật khẩu" value={password} onChange={(event) => setPassword(event.target.value)} />
                <IconButton
                  type="button"
                  className="absolute right-1 top-0.5 border-transparent bg-transparent"
                  label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  icon={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  onClick={() => setShowPassword((value) => !value)}
                />
              </div>
            </FormField>
            <Button className="w-full" size="lg" type="submit" isLoading={submitting} loadingText="Đang đăng nhập">
              Đăng nhập
            </Button>
            <p className="text-center text-sm text-slate-500">
              Chưa có tài khoản? <Link className="font-bold text-primary-700" href="/register">Đăng ký</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
