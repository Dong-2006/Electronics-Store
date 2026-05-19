"use client";

import { Gauge, Package, PlusCircle, Store, TicketPercent, Truck, Undo2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/seller/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/products/create", label: "Add Product", icon: PlusCircle },
  { href: "/seller/orders", label: "Orders", icon: Truck },
  { href: "/seller/vouchers", label: "Vouchers", icon: TicketPercent },
  { href: "/seller/apply", label: "Profile", icon: Store },
  { href: "/", label: "Back to Store", icon: Undo2 }
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 border-r bg-white p-4">
      <div className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-700">
        <Store className="h-5 w-5" /> Seller
      </div>
      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100",
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
