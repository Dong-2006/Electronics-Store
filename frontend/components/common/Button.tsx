import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const variants = {
    primary: "bg-primary-600 text-white shadow-sm shadow-primary-600/20 hover:bg-primary-700",
    secondary: "border border-slate-200 bg-white text-slate-900 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700",
    danger: "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950"
  };

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
