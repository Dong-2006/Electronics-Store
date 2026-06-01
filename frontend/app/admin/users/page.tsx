"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/common/Toast";
import { apiDelete, apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { ApiResponse, User } from "@/types";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    const res = await apiGet<ApiResponse<User[]>>("/admin/users", session!.accessToken);
    setUsers(res.data);
  }

  useEffect(() => {
    if (session?.accessToken) load().catch((error) => toast({ title: "Không tải được user", description: getErrorMessage(error), variant: "error" }));
  }, [session]);

  async function remove() {
    if (!deleteId || !session?.accessToken) return;
    try {
      await apiDelete(`/admin/users/${deleteId}`, session.accessToken);
      setDeleteId(null);
      toast({ title: "Đã xóa user", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể xóa user", description: getErrorMessage(error), variant: "error" });
    }
  }

  return (
    <>
      <AdminHeader title="Quản lý người dùng" />
      <DataTable headers={["Tên", "Email", "Vai trò", "Trạng thái", "Thao tác"]}>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-4 py-3 font-semibold">{user.name}</td>
            <td className="px-4 py-3">{user.email}</td>
            <td className="px-4 py-3">{user.role}</td>
            <td className="px-4 py-3">{user.isActive ? "Hoạt động" : "Đã khóa"}</td>
            <td className="space-x-2 px-4 py-3">
              <Button variant="secondary" onClick={async () => { await apiPut(`/admin/users/${user.id}/status`, { isActive: !user.isActive }, session!.accessToken); toast({ title: "Đã cập nhật user", variant: "success" }); await load(); }}>
                {user.isActive ? "Khóa" : "Mở"}
              </Button>
              {user.role !== "ADMIN" && <Button variant="danger" onClick={() => setDeleteId(user.id)}>Xóa</Button>}
            </td>
          </tr>
        ))}
      </DataTable>
      <ConfirmDialog open={deleteId !== null} title="Xóa user?" description="Thao tác này có thể thất bại nếu user đã có dữ liệu liên quan." confirmLabel="Xóa" onClose={() => setDeleteId(null)} onConfirm={remove} />
    </>
  );
}
