"use client";

import {
  ArrowRight, BadgeCheck, Headphones, Search,
  ShieldCheck, Sparkles, Truck, Zap, Star, TrendingUp, Cpu
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
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
  {
    icon: ShieldCheck,
    title: "Bảo hành minh bạch",
    text: "Thông tin bảo hành, đổi trả và tình trạng sản phẩm rõ ràng, dễ tra cứu.",
    accent: "from-blue-500 to-cyan-400",
    glow: "rgba(59,130,246,0.15)"
  },
  {
    icon: Truck,
    title: "Theo dõi từng shop",
    text: "Order được tách theo seller để xử lý và cập nhật trạng thái chính xác.",
    accent: "from-violet-500 to-purple-400",
    glow: "rgba(139,92,246,0.15)"
  },
  {
    icon: Headphones,
    title: "Hỗ trợ sau mua",
    text: "Wishlist, đánh giá, lịch sử mua hàng và thông báo realtime đầy đủ.",
    accent: "from-orange-500 to-amber-400",
    glow: "rgba(249,115,22,0.15)"
  }
];

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
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
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#0F172A] text-white">

        {/* ── Background layers ── */}
        <div className="pointer-events-none absolute inset-0 select-none">
          {/* Primary glow orbs */}
          <div className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[100px]" />
          <div className="absolute -left-24 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
          <div className="absolute bottom-20 right-40 h-[200px] w-[200px] rounded-full bg-orange-500/10 blur-[60px]" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
              backgroundSize: "72px 72px"
            }}
          />

          {/* Top vignette */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          {/* Floating tech circles */}
          <div className="animate-float absolute right-[8%] top-[15%] h-3 w-3 rounded-full bg-blue-400/60 blur-[1px]" style={{ animationDelay: "0s" }} />
          <div className="animate-float absolute right-[20%] top-[55%] h-2 w-2 rounded-full bg-cyan-400/50" style={{ animationDelay: "1.5s" }} />
          <div className="animate-float absolute left-[12%] top-[40%] h-2 w-2 rounded-full bg-violet-400/50" style={{ animationDelay: "3s" }} />
          <div className="animate-float absolute left-[30%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-orange-400/60" style={{ animationDelay: "2s" }} />
        </div>

        {/* ── Content ── */}
        <div className="container-page relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-16 lg:flex-row lg:gap-16 lg:py-24">

          {/* Left column: Text + CTA */}
          <div className="flex-1 animate-slide-up text-center lg:text-left">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Marketplace thiết bị điện tử
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
              Chọn đồ công nghệ{" "}
              <br className="hidden lg:block" />
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  nhanh hơn,
                </span>
              </span>{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                tự tin hơn.
              </span>
            </h1>

            {/* Sub */}
            <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-slate-400 lg:mx-0">
              ElectroHub gom điện thoại, laptop, phụ kiện và linh kiện PC trong một trải nghiệm mua sắm rõ ràng — dễ lọc, dễ so sánh, dễ theo dõi đơn hàng.
            </p>

            {/* Search */}
            <form
              onSubmit={submitSearch}
              className="mx-auto mt-8 flex max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl lg:mx-0"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm iPhone, MacBook, tai nghe..."
                  className="h-12 w-full rounded-xl bg-white/90 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <button
                type="submit"
                className="ml-1.5 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:from-blue-500 hover:to-blue-400 hover:-translate-y-px"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Actions */}
            <div className="mx-auto mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/products">
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/40">
                  Khám phá sản phẩm
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/compare">
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.5">
                  So sánh sản phẩm
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mx-auto mt-10 flex items-center justify-center gap-4 lg:justify-start">
              <div className="flex -space-x-2.5">
                {["3b82f6", "06b6d4", "8b5cf6", "f97316"].map((c) => (
                  <div key={c} className="h-8 w-8 rounded-full border-2 border-[#0F172A] shadow-sm" style={{ backgroundColor: `#${c}` }} />
                ))}
              </div>
              <div className="text-sm text-slate-400">
                <span className="font-bold text-white">12,000+</span> khách hàng tin dùng
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                  <span className="ml-1 text-xs text-slate-500">4.9/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Product showcase */}
          <div className="relative mt-14 w-full max-w-md animate-fade-in delay-300 lg:mt-0 lg:max-w-[440px]">
            {/* Outer glow */}
            <div className="absolute -inset-6 rounded-3xl bg-blue-600/15 blur-3xl" />

            {/* Card shell */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_80px_rgba(59,130,246,0.2)] backdrop-blur-xl">

              {/* Card header */}
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-4 shadow-lg shadow-blue-600/30">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-100/80">Tech deal nổi bật</p>
                  <p className="mt-0.5 text-base font-black">Setup mới cho góc làm việc</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20 shadow-inner">
                  <Zap className="h-5 w-5" />
                </span>
              </div>

              {/* Product images grid */}
              <div className="grid grid-cols-2 gap-3">
                {heroImages.map((src, i) => (
                  <div
                    key={src}
                    className={`overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 ${i === 0 ? "col-span-2 aspect-[16/8]" : "aspect-[4/3]"}`}
                  >
                    <div className="relative h-full w-full">
                      <Image src={src} alt="Sản phẩm ElectroHub" fill className="object-contain p-4 transition-transform duration-500 hover:scale-105" priority={i === 0} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Micro stats */}
              <div className="mt-4 grid grid-cols-3 divide-x divide-white/8 rounded-2xl border border-white/8 bg-white/5">
                {[{ v: "50+", l: "Thương hiệu" }, { v: "2k+", l: "Sản phẩm" }, { v: "4.9★", l: "Đánh giá" }].map((s) => (
                  <div key={s.l} className="py-3 text-center">
                    <p className="text-base font-black text-white">{s.v}</p>
                    <p className="text-[10px] text-slate-400">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
      </section>

      {/* ══════════════════════════════════════════
          BENEFITS
      ══════════════════════════════════════════ */}
      <section className="container-page section-gap">

        {/* Section label */}
        <div className="mb-10 text-center">
          <span className="muted-label inline-flex items-center gap-1.5 text-blue-600">
            <BadgeCheck className="h-3.5 w-3.5" />
            Tại sao chọn ElectroHub
          </span>
          <h2 className="section-title mt-3">Mua sắm thông minh, an toàn, rõ ràng.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 shadow-card transition-all duration-400 hover:-translate-y-2 hover:shadow-lift"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${item.glow}, transparent 70%)` }}
                />

                {/* Top accent line */}
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative">
                  {/* Icon */}
                  <div className={`mb-5 inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} p-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-7 text-slate-500">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════ */}
      <section className="section-gap">
        {/* Full-width subtle bg */}
        <div className="bg-gradient-to-b from-slate-50/0 via-blue-50/40 to-slate-50/0 py-16">
          <div className="container-page">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <span className="muted-label inline-flex items-center gap-1.5 text-blue-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Danh mục
                </span>
                <h2 className="section-title mt-3">Mua nhanh theo nhu cầu</h2>
              </div>
              <Link
                href="/products"
                className="hidden items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 md:inline-flex"
              >
                Tất cả
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((category, idx) => {
                const hues = [215, 250, 280, 200, 25, 165, 320, 45];
                const hue = hues[idx % hues.length];
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-200 hover:shadow-lift"
                  >
                    {/* Color accent corner */}
                    <div
                      className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                      style={{ backgroundColor: `hsl(${hue}, 75%, 65%)` }}
                    />

                    {/* Top border flash */}
                    <div
                      className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `linear-gradient(90deg, hsl(${hue},75%,55%), hsl(${(hue + 30) % 360},75%,60%))` }}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-900 transition-colors duration-200 group-hover:text-blue-700">
                          {category.name}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {category.description || "Xem sản phẩm phù hợp trong danh mục này."}
                        </p>
                      </div>
                      <span
                        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 transition-all duration-300 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:translate-x-0.5"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════ */}
      <section className="container-page section-gap">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <span className="muted-label inline-flex items-center gap-1.5 text-orange-500">
              <Star className="h-3.5 w-3.5 fill-orange-400" />
              Đề xuất
            </span>
            <h2 className="section-title mt-3">Sản phẩm nổi bật</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-600 transition-all duration-200 hover:bg-orange-100 hover:-translate-y-0.5"
          >
            Xem tất cả
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : displayFeatured.length ? (
          <ProductGrid products={displayFeatured} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
        ) : (
          <EmptyState title="Chưa có sản phẩm nổi bật" description="Sản phẩm mới sẽ xuất hiện tại đây sau khi được admin duyệt." />
        )}
      </section>

      {/* ══════════════════════════════════════════
          LATEST PRODUCTS
      ══════════════════════════════════════════ */}
      <section className="container-page section-gap">
        <div className="mb-10">
          <span className="muted-label inline-flex items-center gap-1.5 text-blue-600">
            <Zap className="h-3.5 w-3.5" />
            Mới cập nhật
          </span>
          <h2 className="section-title mt-3">Sản phẩm mới nhất</h2>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : latest.length ? (
          <ProductGrid products={latest} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
        ) : (
          <EmptyState title="Chưa có sản phẩm mới" />
        )}
      </section>

      {/* ══════════════════════════════════════════
          SELLER CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="container-page section-gap pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] px-8 py-14 text-center shadow-2xl md:px-16 md:py-20">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_110%,rgba(59,130,246,0.45),transparent)]" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
            {/* Top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
                backgroundSize: "48px 48px"
              }}
            />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-300">
              <Cpu className="h-3.5 w-3.5" />
              Trở thành đối tác
            </span>
            <h2 className="mt-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
              Bạn muốn bán hàng{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                trên ElectroHub?
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-400">
              Đăng ký seller, đăng sản phẩm sau khi được duyệt và tiếp cận hàng nghìn khách hàng tiềm năng ngay hôm nay.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {session?.user?.role !== "ADMIN" && (
                <Link href="/seller/apply">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-400">
                    Đăng ký bán hàng
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              )}
              <Link href="/products">
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-8 py-4 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.5">
                  Khám phá sản phẩm
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
