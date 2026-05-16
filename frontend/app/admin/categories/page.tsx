"use client";

import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { apiDelete, apiGet, apiPost, apiPut, getErrorMessage } from "@/lib/api";
import { ApiResponse, Category } from "@/types";

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    const res = await apiGet<ApiResponse<Category[]>>("/categories");
    setItems(res.data);
  }

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { name, description };
    if (editing) await apiPut(`/categories/${editing.id}`, payload, session!.accessToken);
    else await apiPost("/categories", payload, session!.accessToken);
    setEditing(null);
    setName("");
    setDescription("");
    await load();
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
              <Button variant="danger" onClick={async () => { await apiDelete(`/categories/${item.id}`, session!.accessToken); await load(); }}>Xóa</Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
