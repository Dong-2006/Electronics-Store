export function AdminHeader({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Quản trị dữ liệu cửa hàng điện tử</p>
    </div>
  );
}
