import { Heart, Scale, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProductImage } from "@/lib/product-images";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

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
  const finalPrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice);

  return (
    <article className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <Image src={getProductImage(product)} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        {hasDiscount && <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">Sale</span>}
        {product.isFeatured && <span className="absolute right-3 top-3 rounded-md bg-primary-600 px-2 py-1 text-xs font-bold text-white">Nổi bật</span>}
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{product.brand?.name || product.category?.name}</p>
          <Link href={`/product/${product.id}`} className="mt-1 line-clamp-2 min-h-11 font-bold text-slate-950 hover:text-primary-700">
            {product.name}
          </Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{Number(product.rating || 0).toFixed(1)}</span>
            <span className="text-slate-400">| Đã bán {product.sold || 0}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-lg font-black text-primary-700">{formatCurrency(finalPrice)}</span>
          {hasDiscount && <span className="text-sm text-slate-400 line-through">{formatCurrency(product.price)}</span>}
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
