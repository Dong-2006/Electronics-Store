import { Button } from "@/components/common/Button";

export function Pagination({
  page,
  totalPages,
  onChange
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>Trước</Button>
      <span className="text-sm text-slate-600">Trang {page}/{totalPages}</span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Sau</Button>
    </div>
  );
}
