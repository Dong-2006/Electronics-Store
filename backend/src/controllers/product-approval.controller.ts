import { Request, Response } from "express";
import * as approvalService from "../services/product-approval.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await approvalService.listProductApprovals(req.query);
  return successResponse(res, "Danh sách sản phẩm cho duyệt", data);
}

export async function detail(req: Request, res: Response) {
  const data = await approvalService.getProductApproval(Number(req.params.id));
  return successResponse(res, "Chi tiết sản phẩm cho duyệt", data);
}

export async function approve(req: Request, res: Response) {
  const data = await approvalService.approveProduct(Number(req.params.id), req.user!.id);
  return successResponse(res, "Duyệt sản phẩm thành công", data);
}

export async function reject(req: Request, res: Response) {
  const data = await approvalService.rejectProduct(Number(req.params.id), String(req.body.rejectReason || ""));
  return successResponse(res, "Từ chối sản phẩm thành công", data);
}
