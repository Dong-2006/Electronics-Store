import { Request, Response } from "express";
import * as accountService from "../services/account.service";
import { successResponse } from "../utils/response";

export async function profile(req: Request, res: Response) {
  const data = await accountService.getProfile(req.user!.id);
  return successResponse(res, "Thông tin tai khoan", data);
}

export async function updateProfile(req: Request, res: Response) {
  const data = await accountService.updateProfile(req.user!.id, req.body);
  return successResponse(res, "Cập nhật thông tin thành công", data);
}

export async function addresses(req: Request, res: Response) {
  const data = await accountService.listAddresses(req.user!.id);
  return successResponse(res, "Danh sách địa chỉ", data);
}

export async function createAddress(req: Request, res: Response) {
  const data = await accountService.createAddress(req.user!.id, req.body);
  return successResponse(res, "Thêm địa chỉ thành công", data, 201);
}

export async function updateAddress(req: Request, res: Response) {
  const data = await accountService.updateAddress(req.user!.id, Number(req.params.id), req.body);
  return successResponse(res, "Cập nhật địa chỉ thành công", data);
}

export async function deleteAddress(req: Request, res: Response) {
  const data = await accountService.deleteAddress(req.user!.id, Number(req.params.id));
  return successResponse(res, "Xóa địa chỉ thành công", data);
}

export async function defaultAddress(req: Request, res: Response) {
  const data = await accountService.setDefaultAddress(req.user!.id, Number(req.params.id));
  return successResponse(res, "Dat địa chỉ mặc định thành công", data);
}

export async function changePassword(req: Request, res: Response) {
  const data = await accountService.changePassword(req.user!.id, req.body);
  return successResponse(res, "Đổi mật khẩu thành công", data);
}
