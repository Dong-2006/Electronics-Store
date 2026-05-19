import { cn } from "@/lib/utils";
import { OrderStatus, ProductApprovalStatus, SellerStatus, SubOrderStatus } from "@/types";

type Status = ProductApprovalStatus | SellerStatus | SubOrderStatus | OrderStatus;

const colors: Record<Status, string> = {
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
  REFUND_REQUESTED: "bg-fuchsia-100 text-fuchsia-800"
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-bold", colors[status], className)}>
      {status}
    </span>
  );
}
