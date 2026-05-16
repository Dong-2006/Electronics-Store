import { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import { successResponse } from "../utils/response";

export async function list(_req: Request, res: Response) {
  const data = await adminService.listUsers();
  return successResponse(res, "Danh sách user", data);
}

export async function updateStatus(req: Request, res: Response) {
  const data = await adminService.updateUserStatus(Number(req.params.id), Boolean(req.body.isActive));
  return successResponse(res, "Cập nhật trạng thái user thành công", data);
}

export async function remove(req: Request, res: Response) {
  await adminService.deleteUser(Number(req.params.id));
  return successResponse(res, "Xóa user thành công");
}
