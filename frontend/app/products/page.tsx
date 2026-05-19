"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
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

function ProductsContent() {
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search: params.get("search") || "",
    category: params.get("category") || "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest"
  });
  const { addToCart, addWishlist, addCompare } = useShopActions();

  const query = useMemo(() => {
    const search = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && search.set(key, value));
    search.set("page", String(page));
    search.set("limit", "12");
    return search.toString();
  }, [filters, page]);

  useEffect(() => {
    async function loadCatalog() {
      const [categoryRes, brandRes] = await Promise.all([
        apiGet<ApiResponse<Category[]>>("/categories"),
        apiGet<ApiResponse<Brand[]>>("/brands")
      ]);
      setCategories(categoryRes.data);
      setBrands(brandRes.data);
    }
    loadCatalog().catch((error) => alert(getErrorMessage(error)));
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await apiGet<ApiResponse<ProductsPayload>>(`/products?${query}`);
        setProducts(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.total);
      } catch (error) {
        alert(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [query]);

  return (
    <div className="container-page py-8">
      <div className="mb-6 rounded-md bg-slate-950 p-6 text-white shadow-lift">
        <p className="text-sm font-bold uppercase tracking-wide text-primary-100">Catalog</p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">Tìm sản phẩm phù hợp</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">Lọc theo danh mục, thương hiệu, khoảng giá và sắp xếp để rút ngắn thời gian chọn mua.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilter filters={filters} categories={categories} brands={brands} onChange={(next) => { setPage(1); setFilters(next); }} />
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Sản phẩm</h2>
              <p className="text-sm text-slate-500">{totalItems} kết quả phù hợp</p>
            </div>
          </div>
          {loading ? <Loading /> : products.length ? (
            <>
              <ProductGrid products={products} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          ) : <EmptyState title="Không tìm thấy sản phẩm phù hợp" />}
        </section>
      </div>
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
