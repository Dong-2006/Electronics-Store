"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { apiDelete, apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Product } from "@/types";
import { useShopActions } from "@/hooks/useShopActions";

type WishlistItem = { id: number; product: Product };

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addCompare } = useShopActions();

  async function load() {
    const res = await apiGet<ApiResponse<WishlistItem[]>>("/wishlist", session!.accessToken);
    setProducts(res.data.map((item) => item.product));
    setLoading(false);
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) load().catch((error) => alert(getErrorMessage(error)));
  }, [status, session]);

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-5 text-2xl font-bold">Sản phẩm yêu thích</h1>
      {products.length ? (
        <ProductGrid
          products={products}
          onAddToCart={addToCart}
          onCompare={addCompare}
          onWishlist={async (product) => {
            await apiDelete(`/wishlist/${product.id}`, session!.accessToken);
            await load();
          }}
        />
      ) : <EmptyState title="Danh sách yêu thích đang trống" />}
    </div>
  );
}
