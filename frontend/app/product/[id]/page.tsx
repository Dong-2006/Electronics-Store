"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SpecificationTable } from "@/components/product/SpecificationTable";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
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

  async function load() {
    const res = await apiGet<ApiResponse<Payload>>(`/products/${id}`);
    setPayload(res.data);
  }

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, [id]);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="grid gap-8 rounded-md border bg-white p-5 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
        <div>
          <p className="text-sm uppercase text-slate-500">{product.brand?.name}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-black text-primary-700">{formatCurrency(product.discountPrice || product.price)}</span>
            {product.discountPrice && <span className="text-lg text-slate-400 line-through">{formatCurrency(product.price)}</span>}
          </div>
          <p className={product.stock > 0 ? "mt-3 text-emerald-600" : "mt-3 text-red-600"}>
            {product.stock > 0 ? `Còn hàng: ${product.stock}` : "Hết hàng"}
          </p>
          <p className="mt-4 text-slate-600">{product.description}</p>
          <div className="mt-5 flex max-w-xs items-center gap-3">
            <Input type="number" min={1} max={product.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            <Button disabled={product.stock <= 0} onClick={() => addToCart(product, quantity)}>Thêm vào giỏ</Button>
          </div>
          <div className="mt-3 flex gap-3">
            <Button variant="secondary" onClick={() => addWishlist(product)}>Yêu thích</Button>
            <Button variant="secondary" onClick={() => addCompare(product)}>So sánh</Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">Bảo hành {product.warrantyMonths} tháng, hỗ trợ đổi trả theo chính sách cửa hàng.</p>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-3 text-xl font-bold">Thông số kỹ thuật</h2>
          <SpecificationTable specifications={product.specifications} />
        </div>
        <div>
          <h2 className="mb-3 text-xl font-bold">Đánh giá</h2>
          <form onSubmit={submitReview} className="mb-4 space-y-3 rounded-md border bg-white p-4">
            <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
            <Input placeholder="Nhận xét của bạn" value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button type="submit">Gửi đánh giá</Button>
          </form>
          <div className="space-y-3">
            {product.reviews?.map((review) => (
              <div key={review.id} className="rounded-md border bg-white p-4">
                <p className="font-semibold">{review.user?.name || "Khách hàng"} - {review.rating}/5</p>
                <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Sản phẩm liên quan</h2>
        <ProductGrid products={payload.related} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
      </section>
    </div>
  );
}
