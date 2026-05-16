import { ReactNode } from "react";

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-slate-600">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
