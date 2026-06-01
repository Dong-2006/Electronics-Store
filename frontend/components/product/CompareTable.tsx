import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

const baseRows = [
  ["Giá", (p: Product) => formatCurrency(p.discountPrice || p.price)],
  ["Thương hiệu", (p: Product) => p.brand?.name || "-"],
  ["Danh mục", (p: Product) => p.category?.name || "-"],
  ["Bảo hành", (p: Product) => `${p.warrantyMonths} tháng`]
] as const;

export function CompareTable({ products }: { products: Product[] }) {
  const specs = Array.from(
    new Set(products.flatMap((product) => product.specifications?.map((spec) => spec.key) || []))
  );

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            <th className="w-44 px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">Tiêu chí</th>
            {products.map((product) => (
              <th key={product.id} className="min-w-64 px-4 py-4 text-left font-black text-slate-950">{product.name}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {baseRows.map(([label, getter]) => (
            <tr key={label} className="border-b">
              <td className="bg-slate-50 px-4 py-3 font-bold text-slate-700">{label}</td>
              {products.map((product) => <td key={product.id} className="px-4 py-3 font-semibold text-slate-700">{getter(product)}</td>)}
            </tr>
          ))}
          {specs.map((key) => (
            <tr key={key} className="border-b last:border-0">
              <td className="bg-slate-50 px-4 py-3 font-bold text-slate-700">{key}</td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3 text-slate-600">
                  {product.specifications?.find((spec) => spec.key === key)?.value || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
