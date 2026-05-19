"use client";

import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingCart, Store, UserRound, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { NotificationDrawer } from "@/components/layout/NotificationDrawer";
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

  function submit(event: FormEvent) {
    event.preventDefault();
    const keyword = search.trim();
    router.push(keyword ? `/products?search=${encodeURIComponent(keyword)}` : "/products");
    setOpen(false);
  }

  const sellerHref = session?.user.role === "SELLER" ? "/seller/dashboard" : "/seller/apply";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center gap-4">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-600 text-lg font-black text-white shadow-sm shadow-primary-600/25">E</span>
          <span className="text-xl font-black tracking-tight text-slate-950 group-hover:text-primary-700">ElectroHub</span>
        </Link>

        <form onSubmit={submit} className="hidden flex-1 lg:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm điện thoại, laptop, tai nghe..."
              className="h-11 rounded-md bg-slate-50 pl-10"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                pathname === item.href && "bg-primary-50 text-primary-700"
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" href={sellerHref}>
            <Store className="h-4 w-4" /> Bán hàng
          </Link>
          <Link className="rounded-md p-2 text-slate-700 hover:bg-slate-100" href="/wishlist" title="Yêu thích"><Heart className="h-5 w-5" /></Link>
          <Link className="rounded-md p-2 text-slate-700 hover:bg-slate-100" href="/cart" title="Giỏ hàng"><ShoppingCart className="h-5 w-5" /></Link>
          <NotificationDrawer />
          {session?.user.role === "ADMIN" && (
            <Link className="rounded-md p-2 text-slate-700 hover:bg-slate-100" href="/admin/dashboard" title="Admin">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}
          {session ? (
            <>
              <Link className="rounded-md p-2 text-slate-700 hover:bg-slate-100" href="/profile" title="Tài khoản"><UserRound className="h-5 w-5" /></Link>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Button>
            </>
          ) : (
            <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 hover:bg-primary-700" href="/login">
              <UserRound className="h-4 w-4" /> Đăng nhập
            </Link>
          )}
        </nav>

        <button className="ml-auto rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Mở menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-page space-y-3 py-4">
            <form onSubmit={submit} className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sản phẩm" className="pl-10" />
            </form>
            <div className="grid gap-2">
              {[...navItems, { href: sellerHref, label: "Bán hàng" }, { href: "/wishlist", label: "Yêu thích" }, { href: "/cart", label: "Giỏ hàng" }].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  {item.label}
                </Link>
              ))}
              {session?.user.role === "ADMIN" && <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Admin</Link>}
              {session ? (
                <Button variant="ghost" className="justify-start" onClick={() => signOut({ callbackUrl: "/" })}>Đăng xuất</Button>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white">Đăng nhập</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
