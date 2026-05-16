import Link from "next/link";
import { Order } from "@/types";
import { formatCurrency, statusLabel } from "@/lib/utils";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link href={`/orders/${order.id}`} className="block rounded-md border bg-white p-4 hover:shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">Đơn hàng #{order.id}</p>
          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">{statusLabel(order.status)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>{order.items?.length || 0} sản phẩm</span>
        <span className="font-bold text-primary-700">{formatCurrency(order.totalAmount)}</span>
      </div>
    </Link>
  );
}
