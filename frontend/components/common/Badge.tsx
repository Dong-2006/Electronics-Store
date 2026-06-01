import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "border-slate-200 bg-white text-slate-700",
  primary: "border-primary-200 bg-primary-50 text-primary-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-cyan-200 bg-cyan-50 text-cyan-700",
  muted: "border-slate-200 bg-slate-100 text-slate-600"
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
