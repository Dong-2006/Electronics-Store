"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
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
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [form, setForm] = useState(initialForm);

  async function load() {
    if (!session?.accessToken) return;
    const res = await apiGet<ApiResponse<Voucher[]>>("/seller/vouchers", session.accessToken);
    setVouchers(res.data);
  }

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, [session?.accessToken]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken) return;
    await apiPost("/seller/vouchers", { ...form, maxDiscount: form.maxDiscount || null }, session.accessToken);
    setForm(initialForm);
    await load();
  }

  async function toggle(voucher: Voucher) {
    if (!session?.accessToken) return;
    await apiPatch(`/seller/vouchers/${voucher.id}/toggle`, { isActive: !voucher.isActive }, session.accessToken);
    await load();
  }

  async function remove(id: number) {
    if (!session?.accessToken) return;
    await apiDelete(`/seller/vouchers/${id}`, session.accessToken);
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Vouchers</h1>
      <form onSubmit={create} className="mt-5 grid gap-3 rounded-md border bg-white p-4 md:grid-cols-4">
        <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" />
        <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VoucherType })}>
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
          <option value="FREE_SHIP">FREE_SHIP</option>
        </Select>
        <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} placeholder="Gia tri" />
        <Input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })} placeholder="Don toi thieu" />
        <Input value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Giam toi da" />
        <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} placeholder="Luot dung" />
        <Button className="md:col-span-4">Tao voucher</Button>
      </form>

      <div className="mt-5">
        <DataTable headers={["Code", "Loai", "Gia tri", "Don toi thieu", "Han", "Da dung", "Trang thai", "Thao tac"]}>
          {vouchers.map((voucher) => (
            <tr key={voucher.id}>
              <td className="px-4 py-3 font-bold">{voucher.code}</td>
              <td className="px-4 py-3">{voucher.type}</td>
              <td className="px-4 py-3">{voucher.type === "PERCENT" ? `${Number(voucher.value)}%` : formatCurrency(voucher.value)}</td>
              <td className="px-4 py-3">{formatCurrency(voucher.minOrderValue)}</td>
              <td className="px-4 py-3 text-xs">{new Date(voucher.endDate).toLocaleString("vi-VN")}</td>
              <td className="px-4 py-3">{voucher.usedCount}/{voucher.usageLimit}</td>
              <td className="px-4 py-3">{voucher.isActive ? "Active" : "Off"}</td>
              <td className="space-x-2 px-4 py-3">
                <Button variant="secondary" onClick={() => toggle(voucher)}>{voucher.isActive ? "Tat" : "Bat"}</Button>
                <Button variant="danger" onClick={() => remove(voucher.id)}>Xoa</Button>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
