import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  onAddToCart,
  onWishlist,
  onCompare
}: {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  onCompare?: (product: Product) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onWishlist={onWishlist}
          onCompare={onCompare}
        />
      ))}
    </div>
  );
}
