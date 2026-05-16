import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { successResponse } from "../utils/response";

export async function register(req: Request, res: Response) {
  const data = await authService.register(req.body);
  return successResponse(res, "Đăng ký thành công", data, 201);
}

export async function login(req: Request, res: Response) {
  const data = await authService.login(req.body);
  return successResponse(res, "Đăng nhập thành công", data);
}

export async function me(req: Request, res: Response) {
  const data = await authService.getMe(req.user!.id);
  return successResponse(res, "Thông tin tài khoản", data);
}
