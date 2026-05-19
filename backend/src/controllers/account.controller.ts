import { Request, Response } from "express";
import * as accountService from "../services/account.service";
import { successResponse } from "../utils/response";

export async function profile(req: Request, res: Response) {
  const data = await accountService.getProfile(req.user!.id);
  return successResponse(res, "Thong tin tai khoan", data);
}

export async function updateProfile(req: Request, res: Response) {
  const data = await accountService.updateProfile(req.user!.id, req.body);
  return successResponse(res, "Cap nhat thong tin thanh cong", data);
}

export async function addresses(req: Request, res: Response) {
  const data = await accountService.listAddresses(req.user!.id);
  return successResponse(res, "Danh sach dia chi", data);
}

export async function createAddress(req: Request, res: Response) {
  const data = await accountService.createAddress(req.user!.id, req.body);
  return successResponse(res, "Them dia chi thanh cong", data, 201);
}

export async function updateAddress(req: Request, res: Response) {
  const data = await accountService.updateAddress(req.user!.id, Number(req.params.id), req.body);
  return successResponse(res, "Cap nhat dia chi thanh cong", data);
}

export async function deleteAddress(req: Request, res: Response) {
  const data = await accountService.deleteAddress(req.user!.id, Number(req.params.id));
  return successResponse(res, "Xoa dia chi thanh cong", data);
}

export async function defaultAddress(req: Request, res: Response) {
  const data = await accountService.setDefaultAddress(req.user!.id, Number(req.params.id));
  return successResponse(res, "Dat dia chi mac dinh thanh cong", data);
}

export async function changePassword(req: Request, res: Response) {
  const data = await accountService.changePassword(req.user!.id, req.body);
  return successResponse(res, "Doi mat khau thanh cong", data);
}
