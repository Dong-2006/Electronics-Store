import { Request, Response } from "express";
import * as approvalService from "../services/product-approval.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await approvalService.listProductApprovals(req.query);
  return successResponse(res, "Danh sach san pham cho duyet", data);
}

export async function detail(req: Request, res: Response) {
  const data = await approvalService.getProductApproval(Number(req.params.id));
  return successResponse(res, "Chi tiet san pham cho duyet", data);
}

export async function approve(req: Request, res: Response) {
  const data = await approvalService.approveProduct(Number(req.params.id), req.user!.id);
  return successResponse(res, "Duyet san pham thanh cong", data);
}

export async function reject(req: Request, res: Response) {
  const data = await approvalService.rejectProduct(Number(req.params.id), String(req.body.rejectReason || ""));
  return successResponse(res, "Tu choi san pham thanh cong", data);
}
