import { CheckCircle2, Circle } from "lucide-react";
import { cn, statusLabel } from "@/lib/utils";

const steps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

export function OrderTimeline({ status }: { status: string }) {
  const currentIndex = status === "CANCELLED" ? -1 : steps.findIndex((step) => step === status || (status === "SHIPPING" && step === "SHIPPED"));

  if (status === "CANCELLED") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        Đơn hàng đã hủy.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <div key={step} className={cn("rounded-md border p-3", done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-500")}>
            <div className="flex items-center gap-2">
              {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              <span className="text-sm font-bold">{statusLabel(step)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
