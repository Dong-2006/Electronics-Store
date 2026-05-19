import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await productService.listProducts(req.query);
  return successResponse(res, "Danh sach san pham", data);
}

export async function detail(req: Request, res: Response) {
  const data = await productService.getProductById(Number(req.params.id));
  return successResponse(res, "Chi tiet san pham", data);
}

export async function adminList(req: Request, res: Response) {
  const data = await productService.listAdminProducts(req.query);
  return successResponse(res, "Danh sach san pham quan tri", data);
}

export async function create(req: Request, res: Response) {
  const data = await productService.createProduct(req.body, req.user?.id);
  return successResponse(res, "Tao san pham thanh cong", data, 201);
}

export async function update(req: Request, res: Response) {
  const data = await productService.updateProduct(Number(req.params.id), req.body);
  return successResponse(res, "Cap nhat san pham thanh cong", data);
}

export async function remove(req: Request, res: Response) {
  await productService.deleteProduct(Number(req.params.id));
  return successResponse(res, "Xoa san pham thanh cong");
}
