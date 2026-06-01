import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  children: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  className?: string;
};

export function FormField({ label, children, helper, error, className }: Props) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs font-semibold text-red-600">{error}</span>
      ) : helper ? (
        <span className="block text-xs leading-5 text-slate-500">{helper}</span>
      ) : null}
    </label>
  );
}
