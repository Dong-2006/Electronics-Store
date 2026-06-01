"use client";

import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";
import { apiDelete, apiGet, apiPost, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Brand, Category, Product, ProductApprovalStatus, Specification } from "@/types";

type ProductsPayload = { items: Product[] };

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "10",
  image: "https://placehold.co/900x700/eff6ff/1d4ed8?text=Product",
  categoryId: "",
  brandId: "",
  warrantyMonths: "12",
  specifications: "CPU: Đang cập nhật\nRAM: Đang cập nhật\nSSD: Đang cập nhật"
};

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  function specs(): Specification[] {
    return form.specifications
      .split("\n")
      .map((line) => line.split(":"))
      .filter(([key, value]) => key?.trim() && value?.trim())
      .map(([key, ...rest]) => ({ key: key.trim(), value: rest.join(":").trim() }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      categoryId: Number(form.categoryId),
      brandId: Number(form.brandId),
      warrantyMonths: Number(form.warrantyMonths),
      specifications: specs()
    };
    try {
      if (editingId) await apiPut(`/products/${editingId}`, payload, session!.accessToken);
      else await apiPost("/products", payload, session!.accessToken);
      setForm(emptyForm);
      setEditingId(null);
      toast({ title: editingId ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể lưu sản phẩm", description: getErrorMessage(error), variant: "error" });
    }
  }

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
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-md border bg-white p-4 md:grid-cols-2">
        <Input required placeholder="Tên sản phẩm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input required placeholder="URL ảnh" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <Input required type="number" placeholder="Giá" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <Input type="number" placeholder="Giá giảm" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
        <Input required type="number" placeholder="Tồn kho" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <Input required type="number" placeholder="Bảo hành tháng" value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: e.target.value })} />
        <Select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">Chọn danh mục</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select required value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
          <option value="">Chọn thương hiệu</option>
          {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <textarea className="min-h-24 rounded-md border border-slate-300 p-3 text-sm md:col-span-2" placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea className="min-h-28 rounded-md border border-slate-300 p-3 text-sm md:col-span-2" value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit">{editingId ? "Lưu sản phẩm" : "Thêm sản phẩm"}</Button>
          {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Hủy</Button>}
        </div>
      </form>
      {loading ? <TableSkeleton rows={6} columns={8} /> : <DataTable headers={["Tên", "Shop", "Danh mục", "Thương hiệu", "Giá", "Tồn kho", "Duyệt", "Thao tác"]} empty={!products.length}>
        {products.map((product) => (
          <tr key={product.id}>
            <td className="px-4 py-3 font-semibold">{product.name}</td>
            <td className="px-4 py-3">{product.seller?.shopName || "Admin"}</td>
            <td className="px-4 py-3">{product.category?.name}</td>
            <td className="px-4 py-3">{product.brand?.name}</td>
            <td className="px-4 py-3">{formatCurrency(product.discountPrice || product.price)}</td>
            <td className="px-4 py-3">{product.stock}</td>
            <td className="px-4 py-3"><StatusBadge status={product.approvalStatus} /></td>
            <td className="space-x-2 px-4 py-3">
              <Button variant="secondary" onClick={() => {
                setEditingId(product.id);
                setForm({
                  name: product.name,
                  description: product.description,
                  price: String(product.price),
                  discountPrice: product.discountPrice ? String(product.discountPrice) : "",
                  stock: String(product.stock),
                  image: product.image,
                  categoryId: String(product.categoryId),
                  brandId: String(product.brandId),
                  warrantyMonths: String(product.warrantyMonths),
                  specifications: product.specifications?.map((s) => `${s.key}: ${s.value}`).join("\n") || ""
                });
              }}>Sửa</Button>
              <Button variant="danger" onClick={() => setDeleteId(product.id)}>Xóa</Button>
            </td>
          </tr>
        ))}
      </DataTable>}
      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa sản phẩm?"
        description="Sản phẩm sẽ bị ẩn/xóa khỏi danh sách công khai theo logic backend hiện tại."
        confirmLabel="Xóa"
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
      />
    </>
  );
}
