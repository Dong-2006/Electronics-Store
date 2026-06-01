import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "slate";
};

const tones = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-cyan-50 text-cyan-700",
  slate: "bg-slate-100 text-slate-700"
};

export function DashboardStatCard({ label, value, icon: Icon, description, tone = "primary" }: Props) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <span className={cn("grid h-11 w-11 place-items-center rounded-md", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
      {description && <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>}
    </div>
  );
}
