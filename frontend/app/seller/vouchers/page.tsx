"use client";

import { FormEvent, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { Select } from "@/components/common/Select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";
import { apiDelete, apiGet, apiPatch, apiPost, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Voucher, VoucherType } from "@/types";

const initialForm = {
  code: "",
  type: "PERCENT" as VoucherType,
  value: 0,
  minOrderValue: 0,
  maxDiscount: "",
  startDate: "",
  endDate: "",
  usageLimit: 10
};

export default function SellerVouchersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await apiGet<ApiResponse<Voucher[]>>("/seller/vouchers", session.accessToken);
      setVouchers(res.data);
    } catch (error) {
      toast({ title: "Không tải được voucher", description: getErrorMessage(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.accessToken]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return;
    try {
      await apiPost("/seller/vouchers", { ...form, maxDiscount: form.maxDiscount || null }, session.accessToken);
      setForm(initialForm);
      setModalOpen(false);
      toast({ title: "Đã tạo voucher", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể tạo voucher", description: getErrorMessage(error), variant: "error" });
    }
  }

  async function toggle(voucher: Voucher) {
    if (!session?.accessToken) return;
    try {
      await apiPatch(`/seller/vouchers/${voucher.id}/toggle`, { isActive: !voucher.isActive }, session.accessToken);
      await load();
    } catch (error) {
      toast({ title: "Không thể đổi trạng thái voucher", description: getErrorMessage(error), variant: "error" });
    }
  }

  async function remove() {
    if (!session?.accessToken || !deleteId) return;
    try {
      await apiDelete(`/seller/vouchers/${deleteId}`, session.accessToken);
      setDeleteId(null);
      toast({ title: "Đã xóa voucher", variant: "success" });
      await load();
    } catch (error) {
      toast({ title: "Không thể xóa voucher", description: getErrorMessage(error), variant: "error" });
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="muted-label text-emerald-700">Seller vouchers</p>
          <h1 className="text-3xl font-black text-slate-950">Voucher</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo và quản lý mã ưu đãi theo shop.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><PlusCircle className="h-4 w-4" /> Tạo voucher</Button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={8} />
      ) : (
        <DataTable headers={["Code", "Loại", "Giá trị", "Đơn tối thiểu", "Hạn", "Đã dùng", "Trạng thái", "Thao tác"]} empty={!vouchers.length} emptyTitle="Chưa có voucher nào">
          {vouchers.map((voucher) => (
            <tr key={voucher.id}>
              <td className="px-4 py-3 font-bold">{voucher.code}</td>
              <td className="px-4 py-3">{voucher.type}</td>
              <td className="px-4 py-3">{voucher.type === "PERCENT" ? `${Number(voucher.value)}%` : formatCurrency(voucher.value)}</td>
              <td className="px-4 py-3">{formatCurrency(voucher.minOrderValue)}</td>
              <td className="px-4 py-3 text-xs">{new Date(voucher.endDate).toLocaleString("vi-VN")}</td>
              <td className="px-4 py-3">{voucher.usedCount}/{voucher.usageLimit}</td>
              <td className="px-4 py-3"><StatusBadge status={voucher.isActive ? "ACTIVE" : "INACTIVE"} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => toggle(voucher)}>{voucher.isActive ? "Tắt" : "Bật"}</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteId(voucher.id)}>Xóa</Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tạo voucher mới" description="Voucher sẽ được áp dụng theo shop khi buyer checkout.">
        <form onSubmit={create} className="grid gap-4 md:grid-cols-2">
          <FormField label="Mã voucher"><Input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="SALE10" /></FormField>
          <FormField label="Loại">
            <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as VoucherType })}>
              <option value="PERCENT">Giảm phần trăm</option>
              <option value="FIXED">Giảm cố định</option>
              <option value="FREE_SHIP">Miễn phí ship</option>
            </Select>
          </FormField>
          <FormField label="Giá trị"><Input type="number" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} /></FormField>
          <FormField label="Đơn tối thiểu"><Input type="number" value={form.minOrderValue} onChange={(event) => setForm({ ...form, minOrderValue: Number(event.target.value) })} /></FormField>
          <FormField label="Giảm tối đa"><Input value={form.maxDiscount} onChange={(event) => setForm({ ...form, maxDiscount: event.target.value })} /></FormField>
          <FormField label="Lượt dùng"><Input type="number" value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: Number(event.target.value) })} /></FormField>
          <FormField label="Bắt đầu"><Input required type="datetime-local" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></FormField>
          <FormField label="Kết thúc"><Input required type="datetime-local" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></FormField>
          <Button className="md:col-span-2">Tạo voucher</Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa voucher?"
        description="Voucher sẽ bị xóa khỏi shop và không thể dùng trong checkout."
        confirmLabel="Xóa voucher"
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
      />
    </div>
  );
}
