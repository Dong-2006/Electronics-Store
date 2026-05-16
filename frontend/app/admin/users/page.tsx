"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { apiDelete, apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { ApiResponse, User } from "@/types";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);

  async function load() {
    const res = await apiGet<ApiResponse<User[]>>("/admin/users", session!.accessToken);
    setUsers(res.data);
  }

  useEffect(() => {
    if (session?.accessToken) load().catch((error) => alert(getErrorMessage(error)));
  }, [session]);

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
              <Button variant="secondary" onClick={async () => { await apiPut(`/admin/users/${user.id}/status`, { isActive: !user.isActive }, session!.accessToken); await load(); }}>
                {user.isActive ? "Khóa" : "Mở"}
              </Button>
              {user.role !== "ADMIN" && <Button variant="danger" onClick={async () => { await apiDelete(`/admin/users/${user.id}`, session!.accessToken); await load(); }}>Xóa</Button>}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
