"use client";

import { Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { FormField } from "@/components/common/FormField";
import { IconButton } from "@/components/common/IconButton";
import { Input } from "@/components/common/Input";
import { useToast } from "@/components/common/Toast";
import { apiPost, getErrorMessage } from "@/lib/api";
import { ApiResponse } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiPost<ApiResponse<unknown>>("/auth/register", form);
      toast({ title: "Đăng ký thành công", description: "Bạn có thể đăng nhập bằng tài khoản vừa tạo.", variant: "success" });
      router.push("/login");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast({ title: "Không thể đăng ký", description: message, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page grid min-h-[calc(100vh-5rem)] gap-8 py-10 lg:grid-cols-[1fr_480px] lg:items-center">
      <section className="overflow-hidden rounded-md bg-primary-700 p-8 text-white shadow-lift">
        <p className="muted-label text-primary-100">Join ElectroHub</p>
        <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Tạo tài khoản cho trải nghiệm mua sắm cá nhân hóa.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-primary-50">
          Lưu địa chỉ, theo dõi đơn hàng, đánh giá sản phẩm đã mua và mở shop khi bạn sẵn sàng bán hàng.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "Wishlist" },
            { icon: ShieldCheck, title: "Bảo mật" },
            { icon: UserRound, title: "1 tài khoản" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-md border border-white/15 bg-white/10 p-4">
                <Icon className="h-5 w-5 text-cyan-100" />
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
              <p className="muted-label text-primary-700">Tạo tài khoản</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">Đăng ký</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Bắt đầu với các thông tin cơ bản.</p>
            </div>
            {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <FormField label="Họ tên">
              <div className="relative">
                <UserRound className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10" required placeholder="Nguyễn Văn A" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
            </FormField>
            <FormField label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10" type="email" required placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
            </FormField>
            <FormField label="Số điện thoại" helper="Tùy chọn, dùng cho thông tin giao hàng.">
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10" placeholder="0900000000" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </div>
            </FormField>
            <FormField label="Mật khẩu" helper="Tối thiểu 6 ký tự.">
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10 pr-12" type={showPassword ? "text" : "password"} required minLength={6} placeholder="Mật khẩu" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                <IconButton
                  type="button"
                  className="absolute right-1 top-0.5 border-transparent bg-transparent"
                  label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  icon={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  onClick={() => setShowPassword((value) => !value)}
                />
              </div>
            </FormField>
            <Button className="w-full" size="lg" type="submit" isLoading={submitting} loadingText="Đang tạo tài khoản">
              Tạo tài khoản
            </Button>
            <p className="text-center text-sm text-slate-500">
              Đã có tài khoản? <Link className="font-bold text-primary-700" href="/login">Đăng nhập</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
