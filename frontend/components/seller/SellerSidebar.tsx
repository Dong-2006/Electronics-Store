"use client";

import { Gauge, Package, PlusCircle, Store, TicketPercent, Truck, Undo2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/seller/dashboard", label: "Tổng quan", icon: Gauge },
  { href: "/seller/products", label: "Sản phẩm", icon: Package },
  { href: "/seller/products/create", label: "Thêm sản phẩm", icon: PlusCircle },
  { href: "/seller/orders", label: "Đơn hàng", icon: Truck },
  { href: "/seller/vouchers", label: "Voucher", icon: TicketPercent },
  { href: "/seller/apply", label: "Hồ sơ shop", icon: Store },
  { href: "/", label: "Về cửa hàng", icon: Undo2 }
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-3 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-4">
      <div className="mb-3 flex items-center gap-2 text-lg font-black text-emerald-700">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-50"><Store className="h-5 w-5" /></span>
        Seller
      </div>
      <nav className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100",
                active && "bg-emerald-50 text-emerald-700"
              )}
            >
              <Icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
