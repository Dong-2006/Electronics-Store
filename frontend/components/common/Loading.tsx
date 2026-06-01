import { Loader2 } from "lucide-react";

export function Loading({ label = "Đang tải..." }: { label?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-8 text-center text-sm font-semibold text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      {label}
    </div>
  );
}
