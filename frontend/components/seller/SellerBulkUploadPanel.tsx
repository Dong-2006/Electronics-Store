"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileText, Upload } from "lucide-react";
import { Button } from "@/components/common/Button";
import { apiPostCsv, getErrorMessage } from "@/lib/api";
import { ApiResponse } from "@/types";

const MAX_CSV_SIZE = 1024 * 1024;
const TEMPLATE_URL = "/templates/seller-products-bulk-template.csv";

type BulkUploadError = {
  rowNumber: number;
  field: string;
  reason: string;
};

type BulkUploadResult = {
  batch: {
    id: number;
    status: string;
    itemCount: number;
    errorCount: number;
  };
  createdCount: number;
  errorCount: number;
  errors: BulkUploadError[];
};

type Props = {
  token?: string;
  onUploaded: () => Promise<void>;
};

export function SellerBulkUploadPanel({ token, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] || null;
    setResult(null);
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError = validateCsvFile(selectedFile);
    if (validationError) {
      setFile(null);
      setError(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
  }

  async function uploadCsv(event: FormEvent) {
    event.preventDefault();
    if (!file || !token) return;

    setIsUploading(true);
    setError("");
    setResult(null);

    try {
      const csv = await file.text();
      const response = await apiPostCsv<ApiResponse<BulkUploadResult>>(
        "/seller/products/bulk-upload",
        csv,
        token,
        file.name
      );
      setResult(response.data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await onUploaded();
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="mb-6 rounded-md border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">Bulk Upload Products</h2>
          <p className="mt-1 text-sm text-slate-500">CSV sẽ tạo sản phẩm ở trạng thái chờ admin duyệt.</p>
        </div>
        <a
          href={TEMPLATE_URL}
          download
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
        >
          <Download className="h-4 w-4" />
          Tải file mẫu
        </a>
      </div>

      <form onSubmit={uploadCsv} className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="flex min-h-24 cursor-pointer items-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:border-primary-300 hover:bg-primary-50/50">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white text-primary-700 shadow-sm">
            <FileText className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-slate-900">{file?.name || "Chọn file CSV"}</span>
            {file && <span className="mt-1 block text-xs text-slate-500">{formatFileSize(file.size)}</span>}
          </span>
          <input ref={inputRef} className="hidden" type="file" accept=".csv,text/csv" onChange={selectFile} />
        </label>

        <Button className="h-24 lg:w-44" disabled={!file || !token || isUploading} type="submit">
          <Upload className="h-4 w-4" />
          {isUploading ? "Đang upload" : "Upload CSV"}
        </Button>
      </form>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Đã thêm {result.createdCount} sản phẩm, {result.errorCount} dòng lỗi.
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Batch #{result.batch.id} · {result.batch.status} · {result.batch.itemCount} dòng
          </p>
        </div>
      )}

      {result?.errors.length ? (
        <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Dòng</th>
                  <th className="px-3 py-2">Field</th>
                  <th className="px-3 py-2">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {result.errors.map((item, index) => (
                  <tr key={`${item.rowNumber}-${item.field}-${index}`}>
                    <td className="px-3 py-2 font-semibold text-slate-900">{item.rowNumber}</td>
                    <td className="px-3 py-2 text-slate-700">{item.field}</td>
                    <td className="px-3 py-2 text-red-700">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function validateCsvFile(file: File) {
  if (!file.name.toLowerCase().endsWith(".csv")) return "Chỉ được chọn file .csv";
  if (file.size > MAX_CSV_SIZE) return "File CSV vượt quá giới hạn 1MB";
  return "";
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
