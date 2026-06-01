"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getProductImage } from "@/lib/product-images";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const images = useMemo(() => {
    const all = [getProductImage(product), ...(product.images || [])].filter(Boolean);
    return Array.from(new Set(all));
  }, [product]);
  const [active, setActive] = useState(images[0]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
        <Image src={active || getProductImage(product)} alt={product.name} fill className="object-contain p-8 transition duration-500" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((image) => (
            <button
              key={image}
              type="button"
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border bg-white transition hover:border-primary-300",
                active === image ? "border-primary-500 ring-4 ring-primary-100" : "border-slate-200"
              )}
              onClick={() => setActive(image)}
            >
              <Image src={image} alt={product.name} fill className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
