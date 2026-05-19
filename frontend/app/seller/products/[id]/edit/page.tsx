"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loading } from "@/components/common/Loading";
import { SellerProductForm } from "@/components/seller/SellerProductForm";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, Product } from "@/types";

export default function SellerProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    apiGet<ApiResponse<Product>>(`/seller/products/${id}`, session.accessToken)
      .then((res) => setProduct(res.data))
      .catch((error) => alert(getErrorMessage(error)));
  }, [id, session]);

  if (!product) return <Loading />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Sua san pham</h1>
      {product.rejectReason && <p className="mb-4 rounded-md border bg-red-50 p-4 text-red-800">Ly do tu choi: {product.rejectReason}</p>}
      <SellerProductForm product={product} />
    </div>
  );
}
