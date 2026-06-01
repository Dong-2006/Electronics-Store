import { cn, statusLabel } from "@/lib/utils";
import { OrderStatus, PaymentMethod, ProductApprovalStatus, SellerStatus, SubOrderStatus } from "@/types";

type KnownStatus = ProductApprovalStatus | SellerStatus | SubOrderStatus | OrderStatus | PaymentMethod | "UNPAID" | "PAID" | "FAILED" | "REFUNDED" | "ACTIVE" | "INACTIVE";

const colors: Partial<Record<KnownStatus, string>> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  DRAFT: "bg-slate-100 text-slate-700",
  SUSPENDED: "bg-rose-900 text-white",
  PROCESSING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUND_REQUESTED: "bg-fuchsia-100 text-fuchsia-800",
  COD: "bg-slate-100 text-slate-700",
  BANK_TRANSFER: "bg-cyan-100 text-cyan-800",
  VNPAY: "bg-primary-100 text-primary-800",
  MOMO: "bg-pink-100 text-pink-800",
  UNPAID: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  INACTIVE: "bg-slate-100 text-slate-700"
};

export function StatusBadge({ status, className }: { status: KnownStatus | string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", colors[status as KnownStatus] || "bg-slate-100 text-slate-700", className)}>
      {statusLabel(status)}
    </span>
  );
}
