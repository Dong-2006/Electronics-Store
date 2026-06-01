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

  return (
    <article className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift">
      <Link href={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <Image src={getProductImage(product)} alt={product.name} fill className="object-contain p-5 transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {hasDiscount && <Badge variant="danger" className="shadow-sm">Sale</Badge>}
          {product.isFeatured && <Badge variant="primary" className="shadow-sm">Nổi bật</Badge>}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{product.brand?.name || product.category?.name}</p>
          <Link href={`/product/${product.id}`} className="mt-1 line-clamp-2 min-h-11 font-bold text-slate-950 hover:text-primary-700">
            {product.name}
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <RatingStars rating={Number(product.rating || 0)} />
          <span className="text-xs font-semibold text-slate-400">Đã bán {product.sold || 0}</span>
        </div>
        {product.seller?.shopName && (
          <Link href={`/shop/${product.seller.shopSlug}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-primary-50 hover:text-primary-700">
            <Store className="h-3 w-3" />
            <span className="truncate">{product.seller.shopName}</span>
          </Link>
        )}
        <div>
          <ProductPrice price={product.price} discountPrice={product.discountPrice} size="sm" />
        </div>
        <p className={product.stock > 0 ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-red-600"}>
          {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
        </p>
        <div className="grid grid-cols-[1fr_40px_40px] gap-2">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary-600 px-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={product.stock <= 0}
            onClick={() => onAddToCart?.(product)}
            title="Thêm vào giỏ"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm</span>
          </button>
          <button className="grid h-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-primary-50 hover:text-primary-700" onClick={() => onWishlist?.(product)} title="Yêu thích">
            <Heart className="h-4 w-4" />
          </button>
          <button className="grid h-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-primary-50 hover:text-primary-700" onClick={() => onCompare?.(product)} title="So sánh">
            <Scale className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
