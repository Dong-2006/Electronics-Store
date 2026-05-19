"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { ApiResponse, SellerProfile } from "@/types";

type SellersPayload = { items: SellerProfile[] };
type Batch = {
  id: number;
  fileName?: string | null;
  status: string;
  itemCount: number;
  errorCount: number;
  seller?: SellerProfile;
  createdAt: string;
};

export default function AdminBulkUploadPage() {
  const { data: session } = useSession();
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sellerId, setSellerId] = useState("");
  const [fileName, setFileName] = useState("");
  const [csv, setCsv] = useState("");

  async function load() {
    if (!session?.accessToken) return;
    const [sellerRes, batchRes] = await Promise.all([
      apiGet<ApiResponse<SellersPayload>>("/admin/sellers?status=APPROVED&limit=100", session.accessToken),
      apiGet<ApiResponse<Batch[]>>("/admin/bulk-upload/batches", session.accessToken)
    ]);
    setSellers(sellerRes.data.items);
    setBatches(batchRes.data);
  }

  useEffect(() => {
    load().catch((error) => alert(getErrorMessage(error)));
  }, [session?.accessToken]);

  function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    file.text().then(setCsv).catch(() => alert("Khong doc duoc file"));
  }

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !sellerId || !csv) return;
    await apiPost("/admin/products/bulk", { sellerId, fileName, csv }, session.accessToken);
    setCsv("");
    setFileName("");
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Bulk Upload</h1>
      <form onSubmit={upload} className="mt-5 grid gap-4 rounded-md border bg-white p-4">
        <Select value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
          <option value="">Chon seller</option>
          {sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.shopName}</option>)}
        </Select>
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-slate-50 p-6 text-sm text-slate-600">
          <input className="hidden" type="file" accept=".csv,text/csv" onChange={readFile} />
          {fileName || "Chon file CSV"}
        </label>
        <Button disabled={!sellerId || !csv}>Khoi chay dong bo</Button>
      </form>

      <div className="mt-5">
        <DataTable headers={["Batch", "File", "Seller", "Items", "Errors", "Status", "Ngay"]}>
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td className="px-4 py-3 font-semibold">#{batch.id}</td>
              <td className="px-4 py-3">{batch.fileName || "-"}</td>
              <td className="px-4 py-3">{batch.seller?.shopName}</td>
              <td className="px-4 py-3">{batch.itemCount}</td>
              <td className="px-4 py-3 text-red-700">{batch.errorCount}</td>
              <td className="px-4 py-3">{batch.status}</td>
              <td className="px-4 py-3">{new Date(batch.createdAt).toLocaleString("vi-VN")}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
