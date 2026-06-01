import { Request, Response } from "express";
import * as bulkUploadService from "../services/bulk-upload.service";
import { successResponse } from "../utils/response";

export async function run(req: Request, res: Response) {
  const data = await bulkUploadService.runProductBulkUpload(req.user!.id, req.body);
  return successResponse(res, "Nhập sản phẩm hàng loạt thành công", data, 201);
}

export async function sellerRun(req: Request, res: Response) {
  const body = req.body as unknown;
  const objectBody = typeof body === "object" && body !== null ? (body as { csv?: unknown; fileName?: unknown }) : undefined;
  const headerFileName = req.header("x-file-name");
  const fileName = headerFileName ? safeDecodeHeader(headerFileName) : String(objectBody?.fileName || "");
  const csv = typeof body === "string" ? body : typeof objectBody?.csv === "string" ? objectBody.csv : "";

  const data = await bulkUploadService.runSellerProductBulkUpload(req.user!.id, req.sellerProfile!.id, {
    fileName,
    csv
  });
  return successResponse(res, "Đã xử lý file CSV sản phẩm", data, 201);
}

export async function batches(_req: Request, res: Response) {
  const data = await bulkUploadService.listBulkBatches();
  return successResponse(res, "Lịch sử nhập hàng", data);
}

export async function errors(req: Request, res: Response) {
  const data = await bulkUploadService.getBulkBatchErrors(Number(req.params.id));
  return successResponse(res, "Chi tiết lỗi lô hàng", data);
}

function safeDecodeHeader(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
