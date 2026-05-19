import { ReactNode } from "react";

export function DataTable({
  headers,
  children
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-soft">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">{children}</tbody>
      </table>
    </div>
  );
}
