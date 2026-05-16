"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiPost, getErrorMessage } from "@/lib/api";
import { ApiResponse, Product } from "@/types";

export function useShopActions() {
  const { data: session } = useSession();
  const router = useRouter();

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
      alert("Đã thêm vào giỏ hàng");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  async function addWishlist(product: Product) {
    if (!session?.accessToken) {
      router.push("/login");
      return;
    }
    try {
      await apiPost<ApiResponse<unknown>>(`/wishlist/${product.id}`, {}, session.accessToken);
      alert("Đã thêm vào yêu thích");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  function addCompare(product: Product) {
    const current = JSON.parse(localStorage.getItem("compare") || "[]") as Product[];
    const next = [product, ...current.filter((item) => item.id !== product.id)].slice(0, 3);
    localStorage.setItem("compare", JSON.stringify(next));
    router.push("/compare");
  }

  return { addToCart, addWishlist, addCompare };
}
