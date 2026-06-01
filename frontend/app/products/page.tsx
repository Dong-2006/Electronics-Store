"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/common/Badge";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";
import { Pagination } from "@/components/product/Pagination";
import { ProductFilter, ProductFilters } from "@/components/product/ProductFilter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Brand, Category, Product } from "@/types";
import { useShopActions } from "@/hooks/useShopActions";

type ProductsPayload = {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const initialFilters = (params: { get: (name: string) => string | null }): ProductFilters => ({
  search: params.get("search") || "",
  category: params.get("category") || "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest"
});

function ProductsContent() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>(() => initialFilters(params));
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart, addWishlist, addCompare } = useShopActions();

  const query = useMemo(() => {
    const search = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && search.set(key, value));
    search.set("page", String(page));
    search.set("limit", "12");
    return search.toString();
  }, [filters, page]);

  const activeFilters = useMemo(
    () => Object.entries(filters).filter(([, value]) => value && value !== "newest"),
    [filters]
  );

  useEffect(() => {
    async function loadCatalog() {
      const [categoryRes, brandRes] = await Promise.all([
        apiGet<ApiResponse<Category[]>>("/categories"),
        apiGet<ApiResponse<Brand[]>>("/brands")
      ]);
      setCategories(categoryRes.data);
      setBrands(brandRes.data);
    }
    loadCatalog().catch((error) => toast({ title: "Không tải được bộ lọc", description: getErrorMessage(error), variant: "error" }));
  }, [toast]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await apiGet<ApiResponse<ProductsPayload>>(`/products?${query}`);
        setProducts(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      } catch (error) {
        toast({ title: "Không tải được sản phẩm", description: getErrorMessage(error), variant: "error" });
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [query, toast]);

  function updateFilters(next: ProductFilters) {
    setPage(1);
    setFilters(next);
  }

  function clearFilter(key: keyof ProductFilters) {
    updateFilters({ ...filters, [key]: key === "sort" ? "newest" : "" });
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Sản phẩm" }]} />
      <div className="mb-6 overflow-hidden rounded-md bg-slate-950 text-white shadow-lift">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.45),transparent_24rem),radial-gradient(circle_at_85%_20%,rgba(6,182,212,0.22),transparent_22rem)]" />
          <div className="relative">
            <Badge variant="info" className="border-white/20 bg-white/10 text-cyan-100">Catalog</Badge>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">Tìm thiết bị phù hợp</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
              Lọc theo danh mục, thương hiệu, khoảng giá và sắp xếp để rút ngắn thời gian chọn mua.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:hidden">
        <Button variant="secondary" onClick={() => setShowFilters(true)}>
          <SlidersHorizontal className="h-4 w-4" /> Mở bộ lọc
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <ProductFilter filters={filters} categories={categories} brands={brands} onChange={updateFilters} />
        </div>

        <section>
          <div className="mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Sản phẩm</h2>
                <p className="text-sm text-slate-500">{totalItems} kết quả phù hợp</p>
              </div>
              <Badge variant="muted">Sắp xếp: {filters.sort === "price_asc" ? "Giá tăng dần" : filters.sort === "price_desc" ? "Giá giảm dần" : "Mới nhất"}</Badge>
            </div>
            {!!activeFilters.length && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilters.map(([key, value]) => (
                  <button
                    key={key}
                    className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700"
                    onClick={() => clearFilter(key as keyof ProductFilters)}
                  >
                    {key}: {value}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button className="text-xs font-bold text-slate-500 hover:text-primary-700" onClick={() => updateFilters(initialFilters(new URLSearchParams()))}>
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length ? (
            <>
              <ProductGrid products={products} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          ) : (
            <EmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description="Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác."
              action={<Button onClick={() => updateFilters(initialFilters(new URLSearchParams()))}>Xóa bộ lọc</Button>}
            />
          )}
        </section>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} aria-label="Đóng bộ lọc" />
          <aside className="absolute inset-y-0 left-0 w-full max-w-sm overflow-y-auto bg-white p-4 shadow-lift animate-slide-in-right">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">Bộ lọc</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}><X className="h-4 w-4" /></Button>
            </div>
            <ProductFilter filters={filters} categories={categories} brands={brands} onChange={updateFilters} />
            <Button className="mt-4 w-full" onClick={() => setShowFilters(false)}>Áp dụng</Button>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsContent />
    </Suspense>
  );
}
