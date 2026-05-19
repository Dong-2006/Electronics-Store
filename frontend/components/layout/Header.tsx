"use client";

import { Heart, LayoutDashboard, LogOut, Search, ShoppingCart, Store, UserRound } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { NotificationDrawer } from "@/components/layout/NotificationDrawer";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(`/products?search=${encodeURIComponent(search)}`);
  }

  const sellerHref = session?.user.role === "SELLER" ? "/seller/dashboard" : "/seller/apply";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-2xl font-black text-primary-700">ElectroHub</Link>
        <form onSubmit={submit} className="hidden flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tim dien thoai, laptop, tai nghe..."
              className="pl-10"
            />
          </div>
        </form>
        <nav className="flex items-center gap-1">
          <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100" href="/products">San pham</Link>
          <Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100" href={sellerHref}>
            <Store className="h-4 w-4" /> Ban hang
          </Link>
          <Link className="rounded-md p-2 hover:bg-slate-100" href="/wishlist" title="Yeu thich"><Heart className="h-5 w-5" /></Link>
          <Link className="rounded-md p-2 hover:bg-slate-100" href="/cart" title="Gio hang"><ShoppingCart className="h-5 w-5" /></Link>
          <NotificationDrawer />
          {session?.user.role === "ADMIN" && (
            <Link className="rounded-md p-2 hover:bg-slate-100" href="/admin/dashboard" title="Admin">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}
          {session ? (
            <>
              <Link className="rounded-md p-2 hover:bg-slate-100" href="/profile" title="Tai khoan"><UserRound className="h-5 w-5" /></Link>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" /> Dang xuat
              </Button>
            </>
          ) : (
            <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-primary-600 px-4 text-sm font-semibold text-white" href="/login">
              <UserRound className="h-4 w-4" /> Dang nhap
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
