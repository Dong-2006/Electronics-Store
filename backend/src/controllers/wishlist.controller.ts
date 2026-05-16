import { Request, Response } from "express";
import * as wishlistService from "../services/wishlist.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await wishlistService.getWishlist(req.user!.id);
  return successResponse(res, "Danh sách yêu thích", data);
}

export async function add(req: Request, res: Response) {
  const data = await wishlistService.addWishlist(req.user!.id, Number(req.params.productId));
  return successResponse(res, "Đã thêm vào yêu thích", data, 201);
}

export async function remove(req: Request, res: Response) {
  await wishlistService.removeWishlist(req.user!.id, Number(req.params.productId));
  return successResponse(res, "Đã xóa khỏi yêu thích");
}
