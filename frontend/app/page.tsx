"use client";

import { ArrowRight, BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Category, Product } from "@/types";
import { useShopActions } from "@/hooks/useShopActions";

type ProductsPayload = { items: Product[] };

const heroImages = [
  "/images/products/iphone-15.png",
  "/images/products/macbook-air-m2.png",
  "/images/products/sony-wh-1000xm5.png"
];

const benefits = [
  { icon: ShieldCheck, title: "Bảo hành minh bạch", text: "Thông tin bảo hành và đổi trả hiển thị rõ theo từng sản phẩm." },
  { icon: Truck, title: "Giao hàng dễ theo dõi", text: "Quản lý trạng thái đơn hàng, sub-order và shop bán hàng." },
  { icon: Headphones, title: "Hỗ trợ sau mua", text: "Tài khoản, wishlist, đánh giá và lịch sử mua hàng trong một nơi." }
];

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

  const displayFeatured = featured.length ? featured : latest;

  return (
    <div>
      <section className="bg-white">
        <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div className="py-4">
            <span className="inline-flex items-center gap-2 rounded-md bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
              <BadgeCheck className="h-4 w-4" /> Marketplace thiết bị điện tử
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Mua sắm công nghệ dễ chọn, dễ so sánh, dễ theo dõi.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              ElectroHub gom điện thoại, laptop, phụ kiện và linh kiện PC trong một trải nghiệm mua hàng rõ ràng, hiện đại và thân thiện với cả buyer lẫn seller.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products"><Button className="h-11 px-5">Khám phá sản phẩm <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/compare"><Button className="h-11 px-5" variant="secondary">So sánh sản phẩm</Button></Link>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-md bg-slate-950 p-5 text-white shadow-lift">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.35),rgba(15,23,42,0.1))]" />
            <div className="relative grid h-full grid-cols-2 gap-4">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-primary-100">Deal nổi bật</p>
                  <p className="mt-2 text-3xl font-black">Thiết bị mới cho góc làm việc</p>
                </div>
                <Link href="/products?sort=newest" className="inline-flex items-center gap-2 text-sm font-bold text-white">
                  Xem hàng mới <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3">
                {heroImages.map((src, index) => (
                  <div key={src} className="relative overflow-hidden rounded-md bg-white/95 p-2" style={{ minHeight: index === 0 ? 150 : 86 }}>
                    <Image src={src} alt="Sản phẩm ElectroHub" fill className="object-contain p-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary-700">Danh mục</p>
            <h2 className="section-title mt-1">Mua nhanh theo nhu cầu</h2>
          </div>
          <Link className="hidden text-sm font-bold text-primary-700 md:inline-flex" href="/products">Tất cả sản phẩm</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft">
              <p className="font-bold text-slate-950">{category.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{category.description || "Xem sản phẩm phù hợp trong danh mục này."}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          <Link className="text-sm font-bold text-primary-700" href="/products">Xem tất cả</Link>
        </div>
        <ProductGrid products={displayFeatured} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
      </section>

      <section className="container-page py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-page py-8">
        <h2 className="section-title mb-5">Sản phẩm mới</h2>
        <ProductGrid products={latest} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
      </section>
    </div>
  );
}
