import { ReactNode } from "react";
import { EmptyState } from "@/components/common/EmptyState";

export function DataTable({
  headers,
  children,
  empty,
  emptyTitle = "Chưa có dữ liệu",
  emptyDescription = "Dữ liệu sẽ hiển thị tại đây sau khi được tạo hoặc tải từ hệ thống."
}: {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (empty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 [&_tr]:transition [&_tr:hover]:bg-primary-50/30">{children}</tbody>
      </table>
      </div>
    </div>
  );
}
