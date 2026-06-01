import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link href={`/orders/${order.id}`} className="group block rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-black text-slate-950">Đơn hàng #{order.id}</p>
          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3 text-sm">
        <span className="inline-flex items-center gap-2 text-slate-600"><Package className="h-4 w-4" /> {order.items?.length || 0} sản phẩm</span>
        <span className="font-black text-primary-700">{formatCurrency(order.totalAmount)}</span>
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary-700">
        Xem chi tiết <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
