"use client";

import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Input } from "@/components/common/Input";
import { useToast } from "@/components/common/Toast";
import { apiDelete, apiGet, apiPost, apiPut, getErrorMessage } from "@/lib/api";
import { ApiResponse, Category } from "@/types";

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    const res = await apiGet<ApiResponse<Category[]>>("/categories");
    setItems(res.data);
  }

  useEffect(() => {
    load().catch((error) => toast({ title: "Không tải được danh mục", description: getErrorMessage(error), variant: "error" }));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { name, description };
    if (editing) await apiPut(`/categories/${editing.id}`, payload, session!.accessToken);
    else await apiPost("/categories", payload, session!.accessToken);
    toast({ title: editing ? "Đã cập nhật danh mục" : "Đã thêm danh mục", variant: "success" });
    setEditing(null);
    setName("");
    setDescription("");
    await load();
  }

  async function remove() {
    if (!deleteId || !session?.accessToken) return;
    try {
      await apiDelete(`/categories/${deleteId}`, session.accessToken);
      setDeleteId(null);
      toast({ title: "Đã xóa danh mục", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể xóa danh mục", description: getErrorMessage(error), variant: "error" });
    }
  }

  return (
    <>
      <AdminHeader title="Quản lý danh mục" />
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-md border bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
        <Input required placeholder="Tên danh mục" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button type="submit">{editing ? "Lưu" : "Thêm"}</Button>
      </form>
      <DataTable headers={["Tên", "Slug", "Mô tả", "Thao tác"]}>
        {items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3 font-semibold">{item.name}</td>
            <td className="px-4 py-3">{item.slug}</td>
            <td className="px-4 py-3">{item.description}</td>
            <td className="space-x-2 px-4 py-3">
              <Button variant="secondary" onClick={() => { setEditing(item); setName(item.name); setDescription(item.description || ""); }}>Sửa</Button>
              <Button variant="danger" onClick={() => setDeleteId(item.id)}>Xóa</Button>
            </td>
          </tr>
        ))}
      </DataTable>
      <ConfirmDialog open={deleteId !== null} title="Xóa danh mục?" description="Không nên xóa danh mục đang có sản phẩm liên kết." confirmLabel="Xóa" onClose={() => setDeleteId(null)} onConfirm={remove} />
    </>
  );
}
