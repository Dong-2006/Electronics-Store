import { Request, Response } from "express";
import * as bulkUploadService from "../services/bulk-upload.service";
import { successResponse } from "../utils/response";

export async function run(req: Request, res: Response) {
  const data = await bulkUploadService.runProductBulkUpload(req.user!.id, req.body);
  return successResponse(res, "Nhap san pham hang loat thanh cong", data, 201);
}

export async function batches(_req: Request, res: Response) {
  const data = await bulkUploadService.listBulkBatches();
  return successResponse(res, "Lich su nhap hang", data);
}

export async function errors(req: Request, res: Response) {
  const data = await bulkUploadService.getBulkBatchErrors(Number(req.params.id));
  return successResponse(res, "Chi tiet loi lo hang", data);
}
