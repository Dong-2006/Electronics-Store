import { Heart, Scale, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  return (
    <article className="overflow-hidden rounded-md border bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/product/${product.id}`} className="relative block aspect-[4/3] bg-slate-100">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs uppercase text-slate-500">{product.brand?.name}</p>
          <Link href={`/product/${product.id}`} className="line-clamp-2 min-h-11 font-semibold hover:text-primary-700">
            {product.name}
          </Link>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-primary-700">{formatCurrency(product.discountPrice || product.price)}</span>
          {product.discountPrice && <span className="text-sm text-slate-400 line-through">{formatCurrency(product.price)}</span>}
        </div>
        <p className={product.stock > 0 ? "text-sm text-emerald-600" : "text-sm text-red-600"}>
          {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button className="rounded-md bg-primary-600 p-2 text-white disabled:opacity-50" disabled={product.stock <= 0} onClick={() => onAddToCart?.(product)} title="Thêm vào giỏ">
            <ShoppingCart className="mx-auto h-4 w-4" />
          </button>
          <button className="rounded-md bg-slate-100 p-2" onClick={() => onWishlist?.(product)} title="Yêu thích">
            <Heart className="mx-auto h-4 w-4" />
          </button>
          <button className="rounded-md bg-slate-100 p-2" onClick={() => onCompare?.(product)} title="So sánh">
            <Scale className="mx-auto h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
