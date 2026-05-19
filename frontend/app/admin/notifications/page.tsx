"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
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
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return;
    if (!form.title.trim() || !form.message.trim()) {
      setStatus({ type: "error", message: "Vui lòng nhập tiêu đề và nội dung thông báo." });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await apiPost("/admin/notifications/broadcast", {
        ...form,
        title: form.title.trim(),
        message: form.message.trim()
      }, session.accessToken);
      setForm({ title: "", message: "", type: "SYSTEM_ALERT", targetRole: "ALL" });
      setStatus({ type: "success", message: "Đã gửi thông báo." });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Gửi thông báo</h1>
      <form onSubmit={submit} className="mt-5 grid gap-4 rounded-md border bg-white p-5">
        {status && (
          <div className={`flex gap-2 rounded-md border p-3 text-sm ${
            status.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề" />
        <textarea
          className="min-h-32 rounded-md border px-3 py-2 text-sm outline-none focus:border-primary-500"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Nội dung"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as NotificationType })}>
            <option value="SYSTEM_ALERT">Cảnh báo hệ thống</option>
            <option value="PROMOTION">Khuyến mãi</option>
            <option value="ORDER_UPDATE">Cập nhật đơn hàng</option>
            <option value="PAYMENT_STATUS">Thanh toán</option>
            <option value="NEW_ORDER">Đơn hàng mới</option>
          </Select>
          <Select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
            <option value="ALL">Tất cả</option>
            <option value="USER">Người mua</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
        <Button disabled={submitting}>
          <Send className="h-4 w-4" />
          {submitting ? "Đang gửi..." : "Gửi thông báo"}
        </Button>
      </form>
    </div>
  );
}
