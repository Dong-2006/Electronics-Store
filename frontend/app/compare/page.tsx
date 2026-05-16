"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { CompareTable } from "@/components/product/CompareTable";
import { Product } from "@/types";

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(JSON.parse(localStorage.getItem("compare") || "[]"));
  }, []);

  function clear() {
    localStorage.removeItem("compare");
    setProducts([]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">So sánh sản phẩm</h1>
        {!!products.length && <Button variant="secondary" onClick={clear}>Xóa so sánh</Button>}
      </div>
      {products.length >= 2 ? <CompareTable products={products} /> : <EmptyState title="Hãy thêm từ 2 đến 3 sản phẩm để so sánh" />}
    </div>
  );
}
