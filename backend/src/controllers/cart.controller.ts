import { Request, Response } from "express";
import * as cartService from "../services/cart.service";
import { successResponse } from "../utils/response";

export async function getCart(req: Request, res: Response) {
  const data = await cartService.getCart(req.user!.id);
  return successResponse(res, "Giỏ hàng", data);
}

export async function addItem(req: Request, res: Response) {
  const data = await cartService.addCartItem(req.user!.id, req.body);
  return successResponse(res, "Đã thêm vào giỏ hàng", data, 201);
}

export async function updateItem(req: Request, res: Response) {
  const data = await cartService.updateCartItem(
    req.user!.id,
    Number(req.params.id),
    Number(req.body.quantity)
  );
  return successResponse(res, "Cập nhật giỏ hàng thành công", data);
}

export async function removeItem(req: Request, res: Response) {
  await cartService.removeCartItem(req.user!.id, Number(req.params.id));
  return successResponse(res, "Đã xóa sản phẩm khỏi giỏ hàng");
}

export async function clear(req: Request, res: Response) {
  await cartService.clearCart(req.user!.id);
  return successResponse(res, "Đã xóa toàn bộ giỏ hàng");
}
