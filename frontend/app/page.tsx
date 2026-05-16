"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Category, Product } from "@/types";
import { useShopActions } from "@/hooks/useShopActions";

type ProductsPayload = { items: Product[] };

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addWishlist, addCompare } = useShopActions();

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, latestRes, categoriesRes] = await Promise.all([
          apiGet<ApiResponse<ProductsPayload>>("/products?limit=8"),
          apiGet<ApiResponse<ProductsPayload>>("/products?sort=newest&limit=8"),
          apiGet<ApiResponse<Category[]>>("/categories")
        ]);
        setFeatured(productsRes.data.items.filter((item) => item.isFeatured).slice(0, 8));
        setLatest(latestRes.data.items);
        setCategories(categoriesRes.data);
      } catch (error) {
        alert(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">ElectroHub</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Mua sắm điện thoại, laptop, phụ kiện và linh kiện PC chính hãng với quy trình đặt hàng rõ ràng.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/products"><Button>Xem sản phẩm</Button></Link>
              <Link href="/compare"><Button variant="secondary">So sánh</Button></Link>
            </div>
          </div>
          <div className="rounded-md border bg-slate-50 p-6">
            <div className="grid grid-cols-2 gap-3">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`} className="rounded-md bg-white p-4 font-semibold shadow-sm hover:text-primary-700">
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
          <Link className="text-sm font-semibold text-primary-700" href="/products">Xem tất cả</Link>
        </div>
        <ProductGrid products={featured.length ? featured : latest} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-bold">Sản phẩm mới</h2>
        <ProductGrid products={latest} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
      </section>
    </div>
  );
}
