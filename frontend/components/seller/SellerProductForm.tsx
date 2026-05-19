"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { apiGet, apiPost, apiPut, getErrorMessage } from "@/lib/api";
import { ApiResponse, Brand, Category, Product, Specification } from "@/types";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "10",
  image: "https://placehold.co/900x700/eff6ff/1d4ed8?text=Product",
  images: "",
  categoryId: "",
  brandId: "",
  warrantyMonths: "12",
  specifications: "CPU: Dang cap nhat\nRAM: Dang cap nhat\nLuu tru: Dang cap nhat"
};

export function SellerProductForm({ product }: { product?: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([
      apiGet<ApiResponse<Category[]>>("/categories"),
      apiGet<ApiResponse<Brand[]>>("/brands")
    ])
      .then(([categoryRes, brandRes]) => {
        setCategories(categoryRes.data);
        setBrands(brandRes.data);
      })
      .catch((error) => alert(getErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      stock: String(product.stock),
      image: product.image,
      images: product.images?.join("\n") || "",
      categoryId: String(product.categoryId),
      brandId: String(product.brandId),
      warrantyMonths: String(product.warrantyMonths),
      specifications: product.specifications?.map((s) => `${s.key}: ${s.value}`).join("\n") || ""
    });
  }, [product]);

  function specs(): Specification[] {
    return form.specifications
      .split("\n")
      .map((line) => line.split(":"))
      .filter(([key, value]) => key?.trim() && value?.trim())
      .map(([key, ...rest]) => ({ key: key.trim(), value: rest.join(":").trim() }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return;
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      categoryId: Number(form.categoryId),
      brandId: Number(form.brandId),
      warrantyMonths: Number(form.warrantyMonths),
      images: form.images.split("\n").map((item) => item.trim()).filter(Boolean),
      specifications: specs()
    };

    try {
      if (product) await apiPut(`/seller/products/${product.id}`, payload, session.accessToken);
      else await apiPost("/seller/products", payload, session.accessToken);
      alert("San pham da duoc gui cho admin duyet.");
      router.push("/seller/products");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-md border bg-white p-4 md:grid-cols-2">
      <Input required placeholder="Ten san pham" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      <Input required type="number" placeholder="Gia" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      <Input type="number" placeholder="Gia khuyen mai" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
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
      <Input required className="md:col-span-2" placeholder="Anh chinh URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
      <textarea className="min-h-20 rounded-md border border-slate-300 p-3 text-sm md:col-span-2" placeholder="Danh sach anh, moi URL mot dong" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
      <textarea required className="min-h-28 rounded-md border border-slate-300 p-3 text-sm md:col-span-2" placeholder="Mo ta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <textarea className="min-h-28 rounded-md border border-slate-300 p-3 text-sm md:col-span-2" placeholder="Thong so key: value" value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} />
      <Button className="md:col-span-2" type="submit">{product ? "Luu va gui duyet lai" : "Luu va gui duyet"}</Button>
    </form>
  );
}
