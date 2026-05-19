"use client";

import { BellRing, Boxes, CheckSquare, CloudUpload, Gauge, Layers3, Package, ShoppingBag, Store, Tags, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Tổng quan", icon: Gauge },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: Layers3 },
  { href: "/admin/brands", label: "Thương hiệu", icon: Tags },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/sellers", label: "Duyệt seller", icon: Store },
  { href: "/admin/product-approvals", label: "Duyệt sản phẩm", icon: CheckSquare },
  { href: "/admin/bulk-upload", label: "Nhập hàng loạt", icon: CloudUpload },
  { href: "/admin/notifications", label: "Thông báo", icon: BellRing },
  { href: "/admin/users", label: "Người dùng", icon: Users }
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full border-b border-slate-200 bg-white p-3 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-4">
      <div className="mb-3 flex items-center gap-2 text-lg font-black text-primary-700">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary-50"><Boxes className="h-5 w-5" /></span>
        Admin
      </div>
      <nav className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100",
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
