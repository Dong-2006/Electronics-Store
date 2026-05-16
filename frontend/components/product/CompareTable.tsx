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
    <div className="overflow-x-auto rounded-md border bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="w-44 px-4 py-3 text-left">Tiêu chí</th>
            {products.map((product) => (
              <th key={product.id} className="min-w-56 px-4 py-3 text-left">{product.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {baseRows.map(([label, getter]) => (
            <tr key={label} className="border-b">
              <td className="bg-slate-50 px-4 py-3 font-semibold">{label}</td>
              {products.map((product) => <td key={product.id} className="px-4 py-3">{getter(product)}</td>)}
            </tr>
          ))}
          {specs.map((key) => (
            <tr key={key} className="border-b last:border-0">
              <td className="bg-slate-50 px-4 py-3 font-semibold">{key}</td>
              {products.map((product) => (
                <td key={product.id} className="px-4 py-3">
                  {product.specifications?.find((spec) => spec.key === key)?.value || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
