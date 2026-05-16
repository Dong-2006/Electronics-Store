export function Loading({ label = "Đang tải..." }: { label?: string }) {
  return <div className="py-8 text-center text-sm text-slate-500">{label}</div>;
}
