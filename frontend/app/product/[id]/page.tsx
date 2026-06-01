"use client";

import { Heart, Minus, Plus, Scale, ShieldCheck, ShoppingCart, Store, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/common/Badge";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { Textarea } from "@/components/common/Textarea";
import { useToast } from "@/components/common/Toast";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPrice } from "@/components/product/ProductPrice";
import { RatingStars } from "@/components/product/RatingStars";
import { SpecificationTable } from "@/components/product/SpecificationTable";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { ApiResponse, Product } from "@/types";
import { useShopActions } from "@/hooks/useShopActions";

type Payload = { product: Product; related: Product[] };
type Tab = "description" | "specs" | "reviews";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tab, setTab] = useState<Tab>("description");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart, addWishlist, addCompare } = useShopActions();

  const load = useCallback(async () => {
    const res = await apiGet<ApiResponse<Payload>>(`/products/${id}`);
    setPayload(res.data);
  }, [id]);

  useEffect(() => {
    load().catch((error) => toast({ title: "Không tải được sản phẩm", description: getErrorMessage(error), variant: "error" }));
  }, [load, toast]);

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) {
      toast({ title: "Bạn cần đăng nhập", description: "Đăng nhập để đánh giá sản phẩm đã mua.", variant: "warning" });
      return;
    }
    setSubmittingReview(true);
    try {
      await apiPost<ApiResponse<unknown>>(`/products/${id}/reviews`, { rating, comment }, session.accessToken);
      setComment("");
      toast({ title: "Đã gửi đánh giá", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể gửi đánh giá", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSubmittingReview(false);
    }
  }

  if (!payload) return <Loading />;
  const product = payload.product;
  const reviewCount = product.reviews?.length || 0;

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Sản phẩm", href: "/products" }, { label: product.name }]} />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
        <ProductGallery product={product} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.isFeatured && <Badge variant="primary">Nổi bật</Badge>}
                {product.discountPrice && <Badge variant="danger">Đang giảm giá</Badge>}
                <Badge variant={product.stock > 0 ? "success" : "danger"}>{product.stock > 0 ? "Còn hàng" : "Hết hàng"}</Badge>
              </div>
              <p className="mt-5 text-sm font-bold uppercase tracking-wide text-slate-400">{product.brand?.name}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 md:text-4xl">{product.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <RatingStars rating={Number(product.rating || 0)} count={reviewCount} />
                <span className="text-sm font-semibold text-slate-400">Đã bán {product.sold || 0}</span>
              </div>
              <div className="mt-5">
                <ProductPrice price={product.price} discountPrice={product.discountPrice} size="lg" />
              </div>

              {product.seller && (
                <Link href={`/shop/${product.seller.shopSlug}`} className="mt-5 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:border-primary-200 hover:bg-primary-50">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-primary-700 shadow-sm">
                    <Store className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-slate-950">{product.seller.shopName}</span>
                    <span className="text-xs font-semibold text-slate-500">Xem gian hàng</span>
                  </span>
                </Link>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, text: `Bảo hành ${product.warrantyMonths} tháng` },
                  { icon: Truck, text: "Giao theo shop" },
                  { icon: Store, text: product.category?.name || "Thiết bị điện tử" }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                      <Icon className="mb-2 h-4 w-4 text-primary-700" /> {item.text}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-bold text-slate-700">Số lượng</p>
                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="icon" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                    className="w-20 text-center font-bold"
                  />
                  <Button variant="secondary" size="icon" onClick={() => setQuantity((value) => Math.min(product.stock || value + 1, value + 1))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button className="ml-auto flex-1" disabled={product.stock <= 0} onClick={() => addToCart(product, quantity)}>
                    <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => addWishlist(product)}><Heart className="h-4 w-4" /> Yêu thích</Button>
                <Button variant="secondary" onClick={() => addCompare(product)}><Scale className="h-4 w-4" /> So sánh</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8 rounded-md border border-slate-200 bg-white shadow-soft">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2">
          {[
            ["description", "Mô tả"],
            ["specs", "Thông số kỹ thuật"],
            ["reviews", `Đánh giá (${reviewCount})`]
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as Tab)}
              className={tab === value ? "shrink-0 rounded-md bg-primary-600 px-4 py-2 text-sm font-bold text-white" : "shrink-0 rounded-md px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "description" && <p className="max-w-4xl leading-8 text-slate-600">{product.description}</p>}
          {tab === "specs" && <SpecificationTable specifications={product.specifications} />}
          {tab === "reviews" && (
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <form onSubmit={submitReview} className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                <h2 className="font-black text-slate-950">Viết đánh giá</h2>
                <FormField label="Số sao" helper="Bạn chỉ có thể đánh giá sản phẩm đã giao thành công.">
                  <Input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(Number(event.target.value))} />
                </FormField>
                <FormField label="Nhận xét">
                  <Textarea placeholder="Chia sẻ trải nghiệm của bạn" value={comment} onChange={(event) => setComment(event.target.value)} />
                </FormField>
                <Button type="submit" isLoading={submittingReview} loadingText="Đang gửi">Gửi đánh giá</Button>
              </form>
              <div className="space-y-3">
                {product.reviews?.length ? product.reviews.map((review) => (
                  <div key={review.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-black text-slate-950">{review.user?.name || "Khách hàng"}</p>
                      <RatingStars rating={review.rating} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment || "Không có nhận xét."}</p>
                  </div>
                )) : (
                  <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">Sản phẩm liên quan</h2>
          <Link href="/products" className="text-sm font-bold text-primary-700">Xem thêm</Link>
        </div>
        <ProductGrid products={payload.related} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
      </section>
    </div>
  );
}
