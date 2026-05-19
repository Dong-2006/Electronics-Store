import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100",
        className
      )}
      {...props}
    />
  );
}
