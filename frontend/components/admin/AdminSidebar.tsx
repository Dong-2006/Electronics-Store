"use client";

import { BellRing, Boxes, CheckSquare, CloudUpload, Gauge, Layers3, Package, ShoppingBag, Store, Tags, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/admin/products", label: "San pham", icon: Package },
  { href: "/admin/categories", label: "Danh muc", icon: Layers3 },
  { href: "/admin/brands", label: "Thuong hieu", icon: Tags },
  { href: "/admin/orders", label: "Don hang", icon: ShoppingBag },
  { href: "/admin/sellers", label: "Seller Requests", icon: Store },
  { href: "/admin/product-approvals", label: "Product Approvals", icon: CheckSquare },
  { href: "/admin/bulk-upload", label: "Bulk Upload", icon: CloudUpload },
  { href: "/admin/notifications", label: "Notifications", icon: BellRing },
  { href: "/admin/users", label: "Nguoi dung", icon: Users }
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 border-r bg-white p-4">
      <div className="mb-4 flex items-center gap-2 text-lg font-bold text-primary-700">
        <Boxes className="h-5 w-5" /> Admin
      </div>
      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100",
                pathname === item.href && "bg-primary-50 text-primary-700"
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
