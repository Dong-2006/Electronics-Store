import { Request, Response } from "express";
import * as reviewService from "../services/review.service";
import { successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await reviewService.getProductReviews(Number(req.params.productId));
  return successResponse(res, "Danh sách đánh giá", data);
}

export async function create(req: Request, res: Response) {
  const data = await reviewService.createReview(req.user!.id, Number(req.params.productId), req.body);
  return successResponse(res, "Đánh giá thành công", data, 201);
}

export async function remove(req: Request, res: Response) {
  await reviewService.deleteReview(req.user!.id, Number(req.params.id), req.user!.role === "ADMIN");
  return successResponse(res, "Xóa đánh giá thành công");
}
