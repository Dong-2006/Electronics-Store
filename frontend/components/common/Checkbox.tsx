import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  description?: string;
};

export function Checkbox({ label, description, className, ...props }: Props) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-3 transition hover:border-primary-200 hover:bg-primary-50/40", className)}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        {...props}
      />
      <span>
        {label && <span className="block text-sm font-bold text-slate-900">{label}</span>}
        {description && <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>}
      </span>
    </label>
  );
}
