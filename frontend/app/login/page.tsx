"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const benefits = [
  { icon: ShoppingBag, title: "Giỏ hàng", text: "Lưu sản phẩm và tiếp tục thanh toán nhanh." },
  { icon: Truck, title: "Đơn hàng", text: "Theo dõi trạng thái giao hàng theo từng shop." },
  { icon: ShieldCheck, title: "Bảo mật", text: "Một tài khoản cho buyer, seller và admin." }
];

const productShowcase = [
  {
    src: "/images/products/iphone-15.png",
    alt: "iPhone 15",
    className: "left-4 top-10 h-48 w-48 rotate-[-6deg] xl:h-56 xl:w-56"
  },
  {
    src: "/images/products/macbook-air-m2.png",
    alt: "MacBook Air M2",
    className: "right-2 top-0 h-56 w-64 rotate-[5deg] xl:h-64 xl:w-72"
  },
  {
    src: "/images/products/apple-airpods-pro-2.png",
    alt: "Apple AirPods Pro 2",
    className: "bottom-0 left-48 h-40 w-44 rotate-[7deg] xl:left-56 xl:h-44 xl:w-48"
  }
];

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
    <div className="relative -mt-20 min-h-screen overflow-hidden bg-[linear-gradient(135deg,#0F172A_0%,#1E3A8A_48%,#312E81_74%,#7C3AED_100%)] pt-20 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.96)_0%,rgba(15,23,42,0.52)_45%,rgba(124,58,237,0.22)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0F172A] to-transparent" />

      <div className="container-page relative z-10 grid min-h-[calc(100vh-5rem)] items-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:py-12">
        <section className="hidden lg:block">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-sky-200">
              <Sparkles className="h-4 w-4" />
              ElectroHub account
            </div>
            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight text-slate-50 xl:text-6xl">
              Mua sắm công nghệ liền mạch trong một tài khoản.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Đăng nhập để quản lý giỏ hàng, wishlist, đơn hàng theo shop và truy cập seller/admin center khi tài khoản của bạn có quyền.
            </p>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
                  <Icon className="h-5 w-5 text-sky-300" />
                  <p className="mt-3 text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="relative mt-10 h-[360px] max-w-2xl animate-fade-up delay-200">
            <div className="absolute inset-x-10 bottom-7 top-8 rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-blue-950/30 backdrop-blur-xl" />
            <div className="absolute left-12 top-20 h-px w-80 rotate-[-18deg] bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
            <div className="absolute bottom-20 right-8 h-px w-96 rotate-[16deg] bg-gradient-to-r from-transparent via-violet-300/45 to-transparent" />
            {productShowcase.map((product) => (
              <div key={product.src} className={`absolute rounded-[1.75rem] border border-white/15 bg-white/10 shadow-2xl shadow-slate-950/30 backdrop-blur-md ${product.className}`}>
                <Image src={product.src} alt={product.alt} fill sizes="280px" className="object-contain p-5" priority={product.src.includes("iphone")} />
              </div>
            ))}
            <div className="absolute bottom-8 right-10 rounded-2xl border border-white/15 bg-slate-950/55 px-5 py-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-sky-200">Tech deals</p>
              <p className="mt-1 text-2xl font-black text-white">24/7</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[460px] animate-fade-up rounded-[24px] border border-white/20 bg-white/[0.09] p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-700 shadow-lg shadow-blue-950/20">
                  <ShoppingBag className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-sm font-black text-white">ElectroHub</span>
                  <span className="block text-xs font-semibold text-slate-300">Tech marketplace</span>
                </span>
              </Link>
              <span className="rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200">
                Secure
              </span>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-200">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Đăng nhập</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Sign in to continue shopping at ElectroHub.</p>
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold leading-6 text-red-200">
                {error}
              </p>
            )}

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-200">Email</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-12 w-full rounded-xl border border-[#334155] bg-slate-950/45 px-12 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-500 focus:border-sky-400 focus:bg-slate-950/60 focus:ring-2 focus:ring-sky-400/40"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-200">Mật khẩu</span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-12 w-full rounded-xl border border-[#334155] bg-slate-950/45 pl-12 pr-12 text-sm font-semibold text-white outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-500 focus:border-sky-400 focus:bg-slate-950/60 focus:ring-2 focus:ring-sky-400/40"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-all duration-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:bg-[#1D4ED8] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-300">
              Chưa có tài khoản?{" "}
              <Link className="font-bold text-sky-300 transition hover:text-white" href="/register">
                Đăng ký
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
