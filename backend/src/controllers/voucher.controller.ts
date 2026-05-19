import { Request, Response } from "express";
import * as voucherService from "../services/voucher.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await voucherService.listSellerVouchers(req.sellerProfile!.id);
  return successResponse(res, "Danh sách voucher", data);
}

export async function create(req: Request, res: Response) {
  const data = await voucherService.createSellerVoucher(req.sellerProfile!.id, req.body);
  return successResponse(res, "Tạo voucher thành công", data, 201);
}

export async function update(req: Request, res: Response) {
  const data = await voucherService.updateSellerVoucher(req.sellerProfile!.id, Number(req.params.id), req.body);
  return successResponse(res, "Cập nhật voucher thành công", data);
}

export async function remove(req: Request, res: Response) {
  const data = await voucherService.deleteSellerVoucher(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Xóa voucher thành công", data);
}

export async function toggle(req: Request, res: Response) {
  const data = await voucherService.toggleSellerVoucher(req.sellerProfile!.id, Number(req.params.id), Boolean(req.body.isActive));
  return successResponse(res, "Cập nhật trạng thái voucher thành công", data);
}
