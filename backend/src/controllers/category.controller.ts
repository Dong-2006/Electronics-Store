import { Request, Response } from "express";
import * as catalogService from "../services/catalog.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await catalogService.listCategories();
  return successResponse(res, "Danh sách danh mục", data);
}

export async function create(req: Request, res: Response) {
  const data = await catalogService.createCategory(req.body);
  return successResponse(res, "Tạo danh mục thành công", data, 201);
}

export async function update(req: Request, res: Response) {
  const data = await catalogService.updateCategory(Number(req.params.id), req.body);
  return successResponse(res, "Cập nhật danh mục thành công", data);
}

export async function remove(req: Request, res: Response) {
  await catalogService.deleteCategory(Number(req.params.id));
  return successResponse(res, "Xóa danh mục thành công");
}
