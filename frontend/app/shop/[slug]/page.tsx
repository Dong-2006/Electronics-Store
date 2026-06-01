"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Loading } from "@/components/common/Loading";
import { useToast } from "@/components/common/Toast";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useShopActions } from "@/hooks/useShopActions";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Product, SellerProfile } from "@/types";

type ShopPayload = {
  shop: SellerProfile;
  products: Product[];
};

export default function ShopPage() {
  const params = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [payload, setPayload] = useState<ShopPayload | null>(null);
  const { addToCart, addWishlist, addCompare } = useShopActions();

  useEffect(() => {
    apiGet<ApiResponse<ShopPayload>>(`/shops/${params.slug}`)
      .then((res) => setPayload(res.data))
      .catch((error) => toast({ title: "Không tải được shop", description: getErrorMessage(error), variant: "error" }));
  }, [params.slug, toast]);

  if (!payload) return <Loading />;

  return (
    <div>
      <section className="relative min-h-64 bg-slate-900">
        {payload.shop.shopBanner && <Image src={payload.shop.shopBanner} alt={payload.shop.shopName} fill className="object-cover opacity-60" unoptimized />}
        <div className="relative mx-auto flex max-w-7xl items-end gap-5 px-4 py-10 text-white">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-md bg-white text-3xl font-black text-primary-700">
            {payload.shop.shopLogo ? <Image src={payload.shop.shopLogo} alt={payload.shop.shopName} fill className="object-cover" unoptimized /> : payload.shop.shopName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black">{payload.shop.shopName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-100">{payload.shop.shopDescription || "Shop thiết bị điện tử trên ElectroHub"}</p>
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <ProductGrid products={payload.products} onAddToCart={addToCart} onWishlist={addWishlist} onCompare={addCompare} />
      </main>
    </div>
  );
}
