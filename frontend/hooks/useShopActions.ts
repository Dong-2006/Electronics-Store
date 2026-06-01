"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiPost, getErrorMessage } from "@/lib/api";
import { ApiResponse, Product } from "@/types";
import { useToast } from "@/components/common/Toast";

export function useShopActions() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  async function addToCart(product: Product, quantity = 1) {
    if (!session?.accessToken) {
      router.push("/login");
      return;
    }
    try {
      await apiPost<ApiResponse<unknown>>(
        "/cart/items",
        { productId: product.id, quantity },
        session.accessToken
      );
      toast({ title: "Đã thêm vào giỏ hàng", description: product.name, variant: "success" });
    } catch (error) {
      toast({ title: "Không thể thêm vào giỏ hàng", description: getErrorMessage(error), variant: "error" });
    }
  }

  async function addWishlist(product: Product) {
    if (!session?.accessToken) {
      router.push("/login");
      return;
    }
    try {
      await apiPost<ApiResponse<unknown>>(`/wishlist/${product.id}`, {}, session.accessToken);
      toast({ title: "Đã thêm vào yêu thích", description: product.name, variant: "success" });
    } catch (error) {
      toast({ title: "Không thể cập nhật yêu thích", description: getErrorMessage(error), variant: "error" });
    }
  }

  function addCompare(product: Product) {
    const current = JSON.parse(localStorage.getItem("compare") || "[]") as Product[];
    const next = [product, ...current.filter((item) => item.id !== product.id)].slice(0, 3);
    localStorage.setItem("compare", JSON.stringify(next));
    toast({ title: "Đã thêm vào so sánh", description: "Bạn có thể so sánh tối đa 3 sản phẩm.", variant: "info" });
    router.push("/compare");
  }

  return { addToCart, addWishlist, addCompare };
}
