"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";
type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};
type ToastItem = ToastInput & {
  id: number;
  variant: ToastVariant;
};
type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-primary-200 bg-primary-50 text-primary-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900"
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.round(Math.random() * 1000);
    const item: ToastItem = { ...input, id, variant: input.variant || "info" };
    setItems((current) => [item, ...current].slice(0, 5));
    window.setTimeout(() => remove(id), 4200);
  }, [remove]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-24 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {items.map((item) => {
          const Icon = icons[item.variant];
          return (
            <div
              key={item.id}
              className={cn(
                "flex gap-3 rounded-md border p-4 shadow-lift backdrop-blur animate-slide-in-right",
                variantStyles[item.variant]
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-black">{item.title}</p>
                {item.description && <p className="mt-1 text-sm leading-6 opacity-80">{item.description}</p>}
              </div>
              <button className="shrink-0 opacity-70 hover:opacity-100" onClick={() => remove(item.id)} aria-label="Đóng thông báo">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
