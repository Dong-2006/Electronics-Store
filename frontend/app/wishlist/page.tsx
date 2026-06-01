"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { useToast } from "@/components/common/Toast";
import { ProductGrid } from "@/components/product/ProductGrid";
import { apiDelete, apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Product } from "@/types";
import { useShopActions } from "@/hooks/useShopActions";

type WishlistItem = { id: number; product: Product };

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeProduct, setRemoveProduct] = useState<Product | null>(null);
  const { addToCart, addCompare } = useShopActions();

  async function load() {
    const res = await apiGet<ApiResponse<WishlistItem[]>>("/wishlist", session!.accessToken);
    setProducts(res.data.map((item) => item.product));
    setLoading(false);
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      load().catch((error) => {
        toast({ title: "Không tải được wishlist", description: getErrorMessage(error), variant: "error" });
        setLoading(false);
      });
    }
  }, [status, session?.accessToken]);

  async function remove() {
    if (!removeProduct || !session?.accessToken) return;
    try {
      await apiDelete(`/wishlist/${removeProduct.id}`, session.accessToken);
      toast({ title: "Đã xóa khỏi yêu thích", description: removeProduct.name, variant: "success" });
      setRemoveProduct(null);
      await load();
    } catch (error) {
      toast({ title: "Không thể xóa khỏi yêu thích", description: getErrorMessage(error), variant: "error" });
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Yêu thích" }]} />
      <div className="mb-6">
        <p className="muted-label text-primary-700">Wishlist</p>
        <h1 className="section-title mt-1">Sản phẩm yêu thích</h1>
      </div>
      {products.length ? (
        <ProductGrid
          products={products}
          onAddToCart={addToCart}
          onCompare={addCompare}
          onWishlist={(product) => setRemoveProduct(product)}
        />
      ) : (
        <EmptyState
          title="Danh sách yêu thích đang trống"
          description="Lưu lại các sản phẩm bạn quan tâm để quay lại so sánh và mua sau."
          action={<Link href="/products"><Button>Khám phá sản phẩm</Button></Link>}
          icon={<Heart className="h-7 w-7" />}
        />
      )}

      <ConfirmDialog
        open={Boolean(removeProduct)}
        title="Xóa khỏi danh sách yêu thích?"
        description={removeProduct ? `Sản phẩm "${removeProduct.name}" sẽ được xóa khỏi wishlist.` : ""}
        confirmLabel="Xóa"
        onClose={() => setRemoveProduct(null)}
        onConfirm={remove}
      />
    </div>
  );
}
