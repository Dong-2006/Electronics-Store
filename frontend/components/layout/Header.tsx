"use client";

import { Heart, LayoutDashboard, LogOut, Search, ShoppingCart, UserRound } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(`/products?search=${encodeURIComponent(search)}`);
  }

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
              placeholder="Tìm điện thoại, laptop, tai nghe..."
              className="pl-10"
            />
          </div>
        </form>
        <nav className="flex items-center gap-1">
          <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100" href="/products">Sản phẩm</Link>
          <Link className="rounded-md p-2 hover:bg-slate-100" href="/wishlist" title="Yêu thích"><Heart className="h-5 w-5" /></Link>
          <Link className="rounded-md p-2 hover:bg-slate-100" href="/cart" title="Giỏ hàng"><ShoppingCart className="h-5 w-5" /></Link>
          {session?.user.role === "ADMIN" && (
            <Link className="rounded-md p-2 hover:bg-slate-100" href="/admin/dashboard" title="Admin">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}
          {session ? (
            <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4" /> Đăng xuất
            </Button>
          ) : (
            <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-primary-600 px-4 text-sm font-semibold text-white" href="/login">
              <UserRound className="h-4 w-4" /> Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
