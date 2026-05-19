import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await productService.listProducts(req.query);
  return successResponse(res, "Danh sách sản phẩm", data);
}

export async function detail(req: Request, res: Response) {
  const data = await productService.getProductById(Number(req.params.id));
  return successResponse(res, "Chi tiết sản phẩm", data);
}

export async function adminList(req: Request, res: Response) {
  const data = await productService.listAdminProducts(req.query);
  return successResponse(res, "Danh sách sản phẩm quản trị", data);
}

export async function create(req: Request, res: Response) {
  const data = await productService.createProduct(req.body, req.user?.id);
  return successResponse(res, "Tạo sản phẩm thành công", data, 201);
}

export async function update(req: Request, res: Response) {
  const data = await productService.updateProduct(Number(req.params.id), req.body);
  return successResponse(res, "Cập nhật sản phẩm thành công", data);
}

export async function remove(req: Request, res: Response) {
  await productService.deleteProduct(Number(req.params.id));
  return successResponse(res, "Xóa sản phẩm thành công");
}
