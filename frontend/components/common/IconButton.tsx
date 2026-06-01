import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  variant?: "default" | "primary" | "danger";
};

const variants = {
  default: "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700",
  primary: "border-primary-600 bg-primary-600 text-white hover:bg-primary-700",
  danger: "border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
};

export function IconButton({ icon, label, className, variant = "default", ...props }: Props) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-md border text-sm transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
