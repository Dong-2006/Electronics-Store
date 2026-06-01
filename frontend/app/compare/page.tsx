"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
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
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "So sánh" }]} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="muted-label text-primary-700">Compare</p>
          <h1 className="section-title mt-1">So sánh sản phẩm</h1>
        </div>
        {!!products.length && <Button variant="secondary" onClick={clear}>Xóa so sánh</Button>}
      </div>
      {products.length >= 2 ? (
        <CompareTable products={products} />
      ) : (
        <EmptyState
          title="Hãy thêm từ 2 đến 3 sản phẩm để so sánh"
          description="Dùng nút so sánh trên product card để tạo bảng đối chiếu thông số."
          action={<Link href="/products"><Button>Chọn sản phẩm</Button></Link>}
          icon={<Scale className="h-7 w-7" />}
        />
      )}
    </div>
  );
}
