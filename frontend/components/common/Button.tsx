import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loadingText?: string;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  loadingText,
  disabled,
  children,
  ...props
}: Props) {
  const variants = {
    primary: "bg-primary-600 text-white shadow-sm shadow-primary-600/20 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-primary-600/30 active:translate-y-0",
    secondary: "border border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:translate-y-0",
    danger: "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950"
  };
  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-sm",
    icon: "h-10 w-10 px-0 text-sm"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
