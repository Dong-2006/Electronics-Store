"use client";

import { Heart, Scale, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SpecificationTable } from "@/components/product/SpecificationTable";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { getProductImage } from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Product } from "@/types";
import { useShopActions } from "@/hooks/useShopActions";
import { useSession } from "next-auth/react";

type Payload = { product: Product; related: Product[] };

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { addToCart, addWishlist, addCompare } = useShopActions();

  const load = useCallback(async () => {
    const res = await apiGet<ApiResponse<Payload>>(`/products/${id}`);
    setPayload(res.data);
  }, [id]);

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, [load]);

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return alert("Vui lòng đăng nhập để đánh giá");
    try {
      await apiPost<ApiResponse<unknown>>(`/products/${id}/reviews`, { rating, comment }, session.accessToken);
      setComment("");
      await load();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  if (!payload) return <Loading />;
  const product = payload.product;
  const finalPrice = product.discountPrice || product.price;

  return (
    <div className="container-page py-8">
      <section className="grid gap-8 rounded-md border border-slate-200 bg-white p-4 shadow-soft md:p-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
            <Image src={getProductImage(product)} alt={product.name} fill className="object-contain p-6" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, text: `Bảo hành ${product.warrantyMonths} tháng` },
              { icon: Truck, text: "Giao hàng theo shop" },
              { icon: Star, text: `${Number(product.rating || 0).toFixed(1)}/5 từ đánh giá` }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  <Icon className="h-4 w-4 text-primary-700" /> {item.text}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-400">{product.brand?.name}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-black text-primary-700">{formatCurrency(finalPrice)}</span>
            {product.discountPrice && <span className="text-lg text-slate-400 line-through">{formatCurrency(product.price)}</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className={product.stock > 0 ? "rounded-md bg-emerald-50 px-3 py-1 font-bold text-emerald-700" : "rounded-md bg-red-50 px-3 py-1 font-bold text-red-700"}>
              {product.stock > 0 ? `Còn hàng: ${product.stock}` : "Hết hàng"}
            </span>
            <span className="rounded-md bg-slate-100 px-3 py-1 font-bold text-slate-700">Đã bán {product.sold || 0}</span>
          </div>
          <p className="mt-5 leading-7 text-slate-600">{product.description}</p>

          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-bold text-slate-700">Số lượng</p>
            <div className="flex max-w-sm items-center gap-3">
              <Input type="number" min={1} max={product.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              <Button className="h-11 flex-1" disabled={product.stock <= 0} onClick={() => addToCart(product, quantity)}>
                <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => addWishlist(product)}><Heart className="h-4 w-4" /> Yêu thích</Button>
            <Button variant="secondary" onClick={() => addCompare(product)}><Scale className="h-4 w-4" /> So sánh</Button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-3 text-xl font-black text-slate-950">Thông số kỹ thuật</h2>
          <SpecificationTable specifications={product.specifications} />
        </div>
        <div>
          <h2 className="mb-3 text-xl font-black text-slate-950">Đánh giá</h2>
          <form onSubmit={submitReview} className="mb-4 space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-soft">
            <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
            <Input placeholder="Nhận xét của bạn" value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button type="submit">Gửi đánh giá</Button>
          </form>
          <div className="space-y-3">
            {product.reviews?.length ? product.reviews.map((review) => (
              <div key={review.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-bold text-slate-950">{review.user?.name || "Khách hàng"} - {review.rating}/5</p>
                <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
              </div>
            )) : <p className="rounded-md bg-white p-4 text-sm text-slate-500">Chưa có đánh giá nào.</p>}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-black text-slate-950">Sản phẩm liên quan</h2>
        <ProductGrid products={payload.related} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
      </section>
    </div>
  );
}
