import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items, className }: { items: Item[]; className?: string }) {
  return (
    <nav className={cn("mb-5 flex flex-wrap items-center gap-1 text-sm text-slate-500", className)} aria-label="Breadcrumb">
      <Link href="/" className="inline-flex items-center gap-1 font-semibold hover:text-primary-700">
        <Home className="h-4 w-4" />
        Trang chủ
      </Link>
      {items.map((item) => (
        <span key={`${item.label}-${item.href || "current"}`} className="inline-flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-slate-300" />
          {item.href ? (
            <Link href={item.href} className="font-semibold hover:text-primary-700">{item.label}</Link>
          ) : (
            <span className="font-bold text-slate-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
