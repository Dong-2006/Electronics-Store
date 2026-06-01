"use client";

import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingCart, Store, UserRound, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { NotificationDrawer } from "@/components/layout/NotificationDrawer";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/products", label: "Sản phẩm" },
  { href: "/compare", label: "So sánh" }
];

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const keyword = search.trim();
    router.push(keyword ? `/products?search=${encodeURIComponent(keyword)}` : "/products");
    setOpen(false);
  }

  const sellerHref = session?.user.role === "SELLER" ? "/seller/dashboard" : "/seller/apply";
  const isHero = pathname === "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        isHero && !scrolled
          ? "border-b border-white/8 bg-[#0F172A]/80 text-white backdrop-blur-xl"
          : "border-b border-slate-100 bg-white/90 text-slate-900 backdrop-blur-xl shadow-soft"
      )}
    >
      <div className="container-page flex h-[72px] items-center gap-4">

        {/* Logo */}
        <Logo light={isHero && !scrolled} />

        {/* Search bar (desktop) */}
        <form onSubmit={submit} className="hidden flex-1 lg:flex">
          <div className="relative w-full max-w-md">
            <Search
              className={cn(
                "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2",
                isHero && !scrolled ? "text-slate-400" : "text-slate-400"
              )}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm điện thoại, laptop, tai nghe..."
              className={cn(
                "h-10 w-full rounded-xl border pl-11 pr-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                isHero && !scrolled
                  ? "border-white/15 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:bg-white/15"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-300 focus:bg-white"
              )}
            />
          </div>
        </form>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200",
                pathname === item.href
                  ? isHero && !scrolled
                    ? "bg-white/15 text-white"
                    : "bg-blue-50 text-blue-700"
                  : isHero && !scrolled
                  ? "text-slate-300 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href={sellerHref}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200",
              isHero && !scrolled
                ? "text-slate-300 hover:bg-white/10 hover:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Store className="h-4 w-4" />
            Bán hàng
          </Link>

          {/* Icon buttons */}
          <div className="ml-1 flex items-center gap-0.5">
            {[
              { href: "/wishlist", Icon: Heart, title: "Yêu thích" },
              { href: "/cart", Icon: ShoppingCart, title: "Giỏ hàng" }
            ].map(({ href, Icon, title }) => (
              <Link
                key={href}
                href={href}
                title={title}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl transition-all duration-200",
                  isHero && !scrolled
                    ? "text-slate-300 hover:bg-white/10 hover:text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </Link>
            ))}

            <NotificationDrawer light={isHero && !scrolled} />

            {session?.user.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                title="Admin"
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl transition-all duration-200",
                  isHero && !scrolled
                    ? "text-slate-300 hover:bg-white/10 hover:text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <LayoutDashboard className="h-[18px] w-[18px]" />
              </Link>
            )}

            {session ? (
              <>
                <Link
                  href="/profile"
                  title="Tài khoản"
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl transition-all duration-200",
                    isHero && !scrolled
                      ? "text-slate-300 hover:bg-white/10 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <UserRound className="h-[18px] w-[18px]" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={cn(
                    "ml-1 inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-all duration-200",
                    isHero && !scrolled
                      ? "text-slate-300 hover:bg-white/10 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-2 inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-200 hover:from-blue-500 hover:to-blue-400 hover:-translate-y-0.5"
              >
                <UserRound className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className={cn(
            "ml-auto grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 lg:hidden",
            isHero && !scrolled
              ? "text-slate-300 hover:bg-white/10 hover:text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Mở menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="container-page space-y-4 py-5">
            <form onSubmit={submit} className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </form>

            <div className="grid gap-1">
              {[
                ...navItems,
                { href: sellerHref, label: "Bán hàng" },
                { href: "/wishlist", label: "Yêu thích" },
                { href: "/cart", label: "Giỏ hàng" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </Link>
              ))}

              {session?.user.role === "ADMIN" && (
                <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                  Admin
                </Link>
              )}

              {session ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    Tài khoản
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-center text-sm font-bold text-white shadow-md shadow-blue-600/25"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
