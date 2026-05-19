"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SellerSidebar } from "@/components/seller/SellerSidebar";

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const simplePage = pathname === "/seller/apply" || pathname === "/seller/status";

  if (simplePage) return <>{children}</>;

  return (
    <div className="container-page flex flex-col lg:flex-row">
      <SellerSidebar />
      <section className="min-w-0 flex-1 py-6 lg:p-6">{children}</section>
    </div>
  );
}
