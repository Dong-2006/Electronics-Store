"use client";

import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { ProductDetailModal } from "@/components/admin/ProductDetailModal";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";
import { apiDelete, apiGet, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Brand, Category, Product, ProductApprovalStatus } from "@/types";

type ProductsPayload = { items: Product[] };

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  async function load() {
    setLoading(true);
    const query = approvalStatus ? `/admin/products?limit=50&approvalStatus=${approvalStatus}` : "/admin/products?limit=50";
    try {
      const [productRes, categoryRes, brandRes] = await Promise.all([
        apiGet<ApiResponse<ProductsPayload>>(query, session?.accessToken),
        apiGet<ApiResponse<Category[]>>("/categories"),
        apiGet<ApiResponse<Brand[]>>("/brands")
      ]);
      setProducts(productRes.data.items);
      setCategories(categoryRes.data);
      setBrands(brandRes.data);
    } catch (error) {
      toast({ title: "Không tải được sản phẩm", description: getErrorMessage(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.accessToken) load();
  }, [approvalStatus, session?.accessToken]);

  async function remove() {
    if (!deleteId || !session?.accessToken) return;
    try {
      await apiDelete(`/products/${deleteId}`, session.accessToken);
      setDeleteId(null);
      toast({ title: "Đã xóa sản phẩm", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể xóa sản phẩm", description: getErrorMessage(error), variant: "error" });
    }
  }

  return (
    <>
      <AdminHeader title="Quản lý sản phẩm" />
      <Select className="mb-4 max-w-xs" value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)}>
        <option value="">Tất cả trạng thái duyệt</option>
        {(["PENDING", "APPROVED", "REJECTED", "DRAFT"] as ProductApprovalStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
      {loading ? <TableSkeleton rows={6} columns={8} /> : <DataTable headers={["Tên", "Shop", "Danh mục", "Thương hiệu", "Giá", "Tồn kho", "Duyệt", "Thao tác"]} empty={!products.length}>
        {products.map((product) => (
          <tr key={product.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setViewingProduct(product)}>
            <td className="px-4 py-3 font-semibold">{product.name}</td>
            <td className="px-4 py-3">{product.seller?.shopName || "Admin"}</td>
            <td className="px-4 py-3">{product.category?.name}</td>
            <td className="px-4 py-3">{product.brand?.name}</td>
            <td className="px-4 py-3">{formatCurrency(product.discountPrice || product.price)}</td>
            <td className="px-4 py-3">{product.stock}</td>
            <td className="px-4 py-3"><StatusBadge status={product.approvalStatus} /></td>
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              <Button variant="danger" size="sm" onClick={() => setDeleteId(product.id)}>Xóa</Button>
            </td>
          </tr>
        ))}
      </DataTable>}
      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa sản phẩm?"
        description="Sản phẩm này sẽ bị ẩn khỏi cửa hàng và khách hàng không thể nhìn thấy hay mua được nữa. Tuy nhiên dữ liệu lịch sử vẫn sẽ được giữ lại."
        confirmLabel="Đồng ý xóa"
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
      />
      <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} />
    </>
  );
}
