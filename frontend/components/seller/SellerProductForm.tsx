"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { useToast } from "@/components/common/Toast";
import { ProductPrice } from "@/components/product/ProductPrice";
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
  specifications: "CPU: Đang cập nhật\nRAM: Đang cập nhật\nLưu trữ: Đang cập nhật"
};

export function SellerProductForm({ product }: { product?: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<ApiResponse<Category[]>>("/categories"),
      apiGet<ApiResponse<Brand[]>>("/brands")
    ])
      .then(([categoryRes, brandRes]) => {
        setCategories(categoryRes.data);
        setBrands(brandRes.data);
      })
      .catch((error) => toast({ title: "Không tải được danh mục/thương hiệu", description: getErrorMessage(error), variant: "error" }));
  }, [toast]);

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

    setSubmitting(true);
    try {
      if (product) await apiPut(`/seller/products/${product.id}`, payload, session.accessToken);
      else await apiPost("/seller/products", payload, session.accessToken);
      toast({ title: "Sản phẩm đã được gửi duyệt", description: "Admin sẽ kiểm tra trước khi hiển thị công khai.", variant: "success" });
      router.push("/seller/products");
    } catch (error) {
      toast({ title: "Không thể lưu sản phẩm", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Card>
          <CardHeader title="Thông tin cơ bản" description="Tên, slug và mô tả sản phẩm." />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label="Tên sản phẩm"><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField>
            <FormField label="Slug" helper="Để trống nếu muốn hệ thống tự tạo."><Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></FormField>
            <FormField label="Mô tả" className="md:col-span-2"><Textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Giá & tồn kho" description="Giá bán, giá khuyến mãi và số lượng trong kho." />
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField label="Giá"><Input required type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></FormField>
            <FormField label="Giá khuyến mãi"><Input type="number" value={form.discountPrice} onChange={(event) => setForm({ ...form, discountPrice: event.target.value })} /></FormField>
            <FormField label="Tồn kho"><Input required type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Danh mục & thương hiệu" description="Sản phẩm cần danh mục và thương hiệu hợp lệ." />
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField label="Danh mục">
              <Select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                <option value="">Chọn danh mục</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Thương hiệu">
              <Select required value={form.brandId} onChange={(event) => setForm({ ...form, brandId: event.target.value })}>
                <option value="">Chọn thương hiệu</option>
                {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Bảo hành tháng"><Input required type="number" value={form.warrantyMonths} onChange={(event) => setForm({ ...form, warrantyMonths: event.target.value })} /></FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Hình ảnh & thông số" description="Dùng URL ảnh chính và mỗi ảnh phụ trên một dòng." />
          <CardContent className="grid gap-4">
            <FormField label="Ảnh chính URL"><Input required value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></FormField>
            <FormField label="Danh sách ảnh phụ"><Textarea value={form.images} onChange={(event) => setForm({ ...form, images: event.target.value })} /></FormField>
            <FormField label="Thông số kỹ thuật" helper="Mỗi dòng theo dạng key: value."><Textarea value={form.specifications} onChange={(event) => setForm({ ...form, specifications: event.target.value })} /></FormField>
          </CardContent>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader title="Preview" description="Xem nhanh cách sản phẩm hiển thị." />
          <CardContent>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
              {form.image && <Image src={form.image} alt={form.name || "Preview"} fill className="object-contain p-4" unoptimized />}
            </div>
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-400">Sản phẩm shop</p>
            <h3 className="mt-1 line-clamp-2 text-lg font-black text-slate-950">{form.name || "Tên sản phẩm"}</h3>
            <div className="mt-3"><ProductPrice price={form.price || 0} discountPrice={form.discountPrice || null} /></div>
            <p className="mt-2 text-sm text-slate-500">Tồn kho: {form.stock || 0}</p>
            <Button className="mt-5 w-full" type="submit" isLoading={submitting} loadingText="Đang lưu">
              {product ? "Lưu và gửi duyệt lại" : "Lưu và gửi duyệt"}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
