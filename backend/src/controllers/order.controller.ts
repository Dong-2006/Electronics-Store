import { OrderStatus } from "@prisma/client";
import { Request, Response } from "express";
import * as orderService from "../services/order.service";
import { successResponse } from "../utils/response";

export async function create(req: Request, res: Response) {
  const data = await orderService.createOrder(req.user!.id, req.body);
  return successResponse(res, "Đặt hàng thành công", data, 201);
}

export async function myOrders(req: Request, res: Response) {
  const data = await orderService.getMyOrders(req.user!.id);
  return successResponse(res, "Lịch sử đơn hàng", data);
}

export async function detail(req: Request, res: Response) {
  const isAdmin = req.user!.role === "ADMIN";
  const data = await orderService.getOrderById(req.user!.id, Number(req.params.id), isAdmin);
  return successResponse(res, "Chi tiết đơn hàng", data);
}

export async function adminOrders(req: Request, res: Response) {
  const data = await orderService.getAllOrders();
  return successResponse(res, "Danh sách đơn hàng", data);
}

export async function updateStatus(req: Request, res: Response) {
  const data = await orderService.updateOrderStatus(
    Number(req.params.id),
    req.body.status as OrderStatus
  );
  return successResponse(res, "Cập nhật trạng thái đơn hàng thành công", data);
}
