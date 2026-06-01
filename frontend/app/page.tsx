"use client";

import { ArrowRight, BadgeCheck, Headphones, Search, ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/common/Input";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";
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
  { icon: ShieldCheck, title: "Bảo hành minh bạch", text: "Thông tin bảo hành, đổi trả và tình trạng sản phẩm rõ ràng." },
  { icon: Truck, title: "Theo dõi từng shop", text: "Order được tách theo seller để xử lý và cập nhật chính xác." },
  { icon: Headphones, title: "Hỗ trợ sau mua", text: "Wishlist, đánh giá, lịch sử mua hàng và thông báo realtime." }
];

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
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
        toast({ title: "Không tải được dữ liệu trang chủ", description: getErrorMessage(error), variant: "error" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const keyword = search.trim();
    router.push(keyword ? `/products?search=${encodeURIComponent(keyword)}` : "/products");
  }

  const displayFeatured = featured.length ? featured : latest;

  return (
    <div className="space-y-10 pb-8">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.45),transparent_30rem),radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.28),transparent_28rem)]" />
        <div className="container-page relative grid min-h-[620px] gap-10 py-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div className="animate-slide-up">
            <Badge variant="info" className="border-white/20 bg-white/10 text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" /> Marketplace thiết bị điện tử
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
              Chọn đồ công nghệ nhanh hơn, tự tin hơn.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              ElectroHub gom điện thoại, laptop, phụ kiện và linh kiện PC trong một trải nghiệm mua sắm rõ ràng: dễ lọc, dễ so sánh, dễ theo dõi đơn hàng.
            </p>
            <form onSubmit={submitSearch} className="mt-7 flex max-w-2xl flex-col gap-3 rounded-md border border-white/15 bg-white/10 p-2 backdrop-blur sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm iPhone, laptop, tai nghe..."
                  className="h-12 border-white/10 bg-white pl-10 text-slate-950"
                />
              </div>
              <Button size="lg" className="sm:w-40">
                Tìm kiếm
              </Button>
            </form>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products"><Button size="lg">Khám phá sản phẩm <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/compare"><Button size="lg" variant="secondary">So sánh sản phẩm</Button></Link>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="rounded-md border border-white/15 bg-white/10 p-4 shadow-lift backdrop-blur-xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-md bg-white p-4 text-slate-950">
                  <div>
                    <p className="text-sm font-bold text-primary-700">Tech deal nổi bật</p>
                    <p className="mt-1 text-2xl font-black">Setup mới cho góc làm việc</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-primary-50 text-primary-700">
                    <Zap className="h-6 w-6" />
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {heroImages.map((src, index) => (
                    <div key={src} className={index === 0 ? "relative col-span-2 aspect-[16/8] overflow-hidden rounded-md bg-white" : "relative aspect-[4/3] overflow-hidden rounded-md bg-white"}>
                      <Image src={src} alt="Sản phẩm ElectroHub" fill className="object-contain p-5" priority={index === 0} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page">
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
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

      <section className="container-page">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="muted-label text-primary-700">Danh mục</p>
            <h2 className="section-title mt-1">Mua nhanh theo nhu cầu</h2>
          </div>
          <Link className="hidden text-sm font-bold text-primary-700 md:inline-flex" href="/products">Tất cả sản phẩm</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`} className="group rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950 group-hover:text-primary-700">{category.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{category.description || "Xem sản phẩm phù hợp trong danh mục này."}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-600" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="muted-label text-primary-700">Đề xuất</p>
            <h2 className="section-title mt-1">Sản phẩm nổi bật</h2>
          </div>
          <Link className="text-sm font-bold text-primary-700" href="/products">Xem tất cả</Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : displayFeatured.length ? (
          <ProductGrid products={displayFeatured} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
        ) : (
          <EmptyState title="Chưa có sản phẩm nổi bật" description="Sản phẩm mới sẽ xuất hiện tại đây sau khi được admin duyệt." />
        )}
      </section>

      <section className="container-page">
        <div className="mb-5">
          <p className="muted-label text-primary-700">Mới cập nhật</p>
          <h2 className="section-title mt-1">Sản phẩm mới</h2>
        </div>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : latest.length ? (
          <ProductGrid products={latest} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
        ) : (
          <EmptyState title="Chưa có sản phẩm mới" />
        )}
      </section>
    </div>
  );
}
