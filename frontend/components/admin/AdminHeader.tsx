export function AdminHeader({
  title,
  description = "Quản trị dữ liệu cửa hàng điện tử, đơn hàng, seller và thông báo."
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Admin console</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
