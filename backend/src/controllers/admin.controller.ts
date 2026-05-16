import { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import { successResponse } from "../utils/response";

export async function stats(_req: Request, res: Response) {
  const data = await adminService.getDashboardStats();
  return successResponse(res, "Thống kê dashboard", data);
}

export async function revenue(_req: Request, res: Response) {
  const data = await adminService.getRevenue();
  return successResponse(res, "Thống kê doanh thu", data);
}

export async function bestSellingProducts(_req: Request, res: Response) {
  const data = await adminService.getBestSellingProducts();
  return successResponse(res, "Sản phẩm bán chạy", data);
}
