import { SlidersHorizontal } from "lucide-react";
import { Brand, Category } from "@/types";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";

export type ProductFilters = {
  search: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
};

export function ProductFilter({
  filters,
  categories,
  brands,
  onChange
}: {
  filters: ProductFilters;
  categories: Category[];
  brands: Brand[];
  onChange: (filters: ProductFilters) => void;
}) {
  const set = (key: keyof ProductFilters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <aside className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-soft lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary-50 text-primary-700">
          <SlidersHorizontal className="h-4 w-4" />
        </span>
        <div>
          <p className="font-bold text-slate-950">Bộ lọc</p>
          <p className="text-xs text-slate-500">Tìm đúng sản phẩm nhanh hơn</p>
        </div>
      </div>
      <Input placeholder="Tìm kiếm" value={filters.search} onChange={(e) => set("search", e.target.value)} />
      <Select value={filters.category} onChange={(e) => set("category", e.target.value)}>
        <option value="">Tất cả danh mục</option>
        {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
      </Select>
      <Select value={filters.brand} onChange={(e) => set("brand", e.target.value)}>
        <option value="">Tất cả thương hiệu</option>
        {brands.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="Giá từ" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} />
        <Input type="number" placeholder="Giá đến" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} />
      </div>
      <Select value={filters.sort} onChange={(e) => set("sort", e.target.value)}>
        <option value="newest">Mới nhất</option>
        <option value="price_asc">Giá tăng dần</option>
        <option value="price_desc">Giá giảm dần</option>
      </Select>
    </aside>
  );
}
