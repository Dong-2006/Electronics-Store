import { Request, Response } from "express";
import * as catalogService from "../services/catalog.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await catalogService.listBrands();
  return successResponse(res, "Danh sách thương hiệu", data);
}

export async function create(req: Request, res: Response) {
  const data = await catalogService.createBrand(req.body);
  return successResponse(res, "Tạo thương hiệu thành công", data, 201);
}

export async function update(req: Request, res: Response) {
  const data = await catalogService.updateBrand(Number(req.params.id), req.body);
  return successResponse(res, "Cập nhật thương hiệu thành công", data);
}

export async function remove(req: Request, res: Response) {
  await catalogService.deleteBrand(Number(req.params.id));
  return successResponse(res, "Xóa thương hiệu thành công");
}
