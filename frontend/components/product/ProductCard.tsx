import { Heart, Scale, ShoppingCart, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { getProductImage } from "@/lib/product-images";
import { Product } from "@/types";
import { ProductPrice } from "./ProductPrice";
import { RatingStars } from "./RatingStars";

export function ProductCard({
  product,
  onAddToCart,
  onWishlist,
  onCompare
}: {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  onCompare?: (product: Product) => void;
}) {
  const hasDiscount = Boolean(product.discountPrice);
  const inStock = product.stock > 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-blue-100/80 hover:shadow-lift">

      {/* Gradient top border on hover */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Image zone */}
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50"
      >
        <Image
          src={getProductImage(product)}
          alt={product.name}
          fill
          className="object-contain p-5 transition-transform duration-500 group-hover:scale-108"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {hasDiscount && (
            <span className="rounded-lg bg-rose-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md shadow-rose-500/25">
              Sale
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md shadow-blue-500/25">
              Nổi bật
            </span>
          )}
        </div>

        {/* Quick action buttons — appear on hover */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => { e.preventDefault(); onWishlist?.(product); }}
            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-100 bg-white/90 text-slate-500 shadow-soft backdrop-blur-sm transition hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100"
            title="Yêu thích"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onCompare?.(product); }}
            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-100 bg-white/90 text-slate-500 shadow-soft backdrop-blur-sm transition hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
            title="So sánh"
          >
            <Scale className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white">Hết hàng</span>
          </div>
        )}
      </Link>

      {/* Info zone */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Brand / Category label */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {product.brand?.name || product.category?.name}
        </p>

        {/* Product name */}
        <Link
          href={`/product/${product.id}`}
          className="line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-slate-900 transition-colors duration-200 hover:text-blue-600"
        >
          {product.name}
        </Link>

        {/* Rating + Sold */}
        <div className="flex items-center justify-between gap-2">
          <RatingStars rating={Number(product.rating || 0)} />
          <span className="text-[11px] font-semibold text-slate-400">Đã bán {product.sold || 0}</span>
        </div>

        {/* Shop pill */}
        {product.seller?.shopName && (
          <Link
            href={`/shop/${product.seller.shopSlug}`}
            className="inline-flex max-w-full items-center gap-1 self-start rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700"
          >
            <Store className="h-3 w-3 shrink-0" />
            <span className="truncate">{product.seller.shopName}</span>
          </Link>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <ProductPrice price={product.price} discountPrice={product.discountPrice} size="sm" />

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className={`text-xs font-semibold ${inStock ? "text-emerald-600" : "text-slate-400"}`}>
            {inStock ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
          </span>
        </div>

        {/* CTA */}
        <button
          className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:from-blue-500 hover:to-blue-400 hover:-translate-y-0.5 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:transform-none disabled:shadow-none"
          disabled={!inStock}
          onClick={() => onAddToCart?.(product)}
        >
          <ShoppingCart className="h-4 w-4" />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  );
}
