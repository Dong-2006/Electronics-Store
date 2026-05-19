"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SellerSidebar } from "@/components/seller/SellerSidebar";

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const simplePage = pathname === "/seller/apply" || pathname === "/seller/status";

  if (simplePage) return <>{children}</>;

  return (
    <div className="mx-auto flex max-w-7xl">
      <SellerSidebar />
      <section className="flex-1 bg-slate-50 p-6">{children}</section>
    </div>
  );
}
