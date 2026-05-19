"use client";

import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
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
  specifications: "CPU: Dang cap nhat\nRAM: Dang cap nhat\nSSD: Dang cap nhat"
};

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const query = approvalStatus ? `/admin/products?limit=50&approvalStatus=${approvalStatus}` : "/admin/products?limit=50";
    const [productRes, categoryRes, brandRes] = await Promise.all([
      apiGet<ApiResponse<ProductsPayload>>(query, session?.accessToken),
      apiGet<ApiResponse<Category[]>>("/categories"),
      apiGet<ApiResponse<Brand[]>>("/brands")
    ]);
    setProducts(productRes.data.items);
    setCategories(categoryRes.data);
    setBrands(brandRes.data);
  }

  useEffect(() => {
    if (session?.accessToken) load().catch((error) => alert(getErrorMessage(error)));
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
      await load();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  return (
    <>
      <AdminHeader title="Quan ly san pham" />
      <Select className="mb-4 max-w-xs" value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)}>
        <option value="">Tat ca trang thai duyet</option>
        {(["PENDING", "APPROVED", "REJECTED", "DRAFT"] as ProductApprovalStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-md border bg-white p-4 md:grid-cols-2">
        <Input required placeholder="Ten san pham" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input required placeholder="URL anh" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <Input required type="number" placeholder="Gia" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <Input type="number" placeholder="Gia giam" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
        <Input required type="number" placeholder="Ton kho" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <Input required type="number" placeholder="Bao hanh thang" value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: e.target.value })} />
        <Select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">Chon danh muc</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select required value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
          <option value="">Chon thuong hieu</option>
          {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <textarea className="min-h-24 rounded-md border border-slate-300 p-3 text-sm md:col-span-2" placeholder="Mo ta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea className="min-h-28 rounded-md border border-slate-300 p-3 text-sm md:col-span-2" value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit">{editingId ? "Luu san pham" : "Them san pham"}</Button>
          {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Huy</Button>}
        </div>
      </form>
      <DataTable headers={["Ten", "Shop", "Danh muc", "Thuong hieu", "Gia", "Ton kho", "Duyet", "Thao tac"]}>
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
              }}>Sua</Button>
              <Button variant="danger" onClick={async () => { await apiDelete(`/products/${product.id}`, session!.accessToken); await load(); }}>Xoa</Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
