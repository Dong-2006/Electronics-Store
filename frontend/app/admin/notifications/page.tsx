"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { apiPost, getErrorMessage } from "@/lib/api";
import { NotificationType } from "@/types";

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "SYSTEM_ALERT" as NotificationType,
    targetRole: "ALL"
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return;
    try {
      await apiPost("/admin/notifications/broadcast", form, session.accessToken);
      setForm({ title: "", message: "", type: "SYSTEM_ALERT", targetRole: "ALL" });
      alert("Da gui thong bao");
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <form onSubmit={submit} className="mt-5 grid gap-4 rounded-md border bg-white p-5">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tieu de" />
        <textarea
          className="min-h-32 rounded-md border px-3 py-2 text-sm outline-none focus:border-primary-500"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Noi dung"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as NotificationType })}>
            <option value="SYSTEM_ALERT">SYSTEM_ALERT</option>
            <option value="PROMOTION">PROMOTION</option>
            <option value="ORDER_UPDATE">ORDER_UPDATE</option>
            <option value="PAYMENT_STATUS">PAYMENT_STATUS</option>
          </Select>
          <Select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
            <option value="ALL">Tat ca</option>
            <option value="USER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
        <Button>Gui thong bao</Button>
      </form>
    </div>
  );
}
