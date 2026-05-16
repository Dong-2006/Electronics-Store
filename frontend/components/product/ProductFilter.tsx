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
    <aside className="space-y-3 rounded-md border bg-white p-4">
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
