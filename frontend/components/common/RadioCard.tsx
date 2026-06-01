import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  checked: boolean;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  name?: string;
};

export function RadioCard({ checked, title, description, icon, onClick, name }: Props) {
  return (
    <button
      type="button"
      name={name}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-md border bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft",
        checked ? "border-primary-500 ring-4 ring-primary-100" : "border-slate-200"
      )}
    >
      {icon && <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-md", checked ? "bg-primary-50 text-primary-700" : "bg-slate-100 text-slate-500")}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-slate-950">{title}</span>
        {description && <span className="mt-1 block text-sm leading-6 text-slate-500">{description}</span>}
      </span>
      <span className={cn("mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border", checked ? "border-primary-600 bg-primary-600" : "border-slate-300")}>
        {checked && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}
