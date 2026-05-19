import { Request, Response } from "express";
import * as sellerService from "../services/seller.service";
import { successResponse } from "../utils/response";

export async function apply(req: Request, res: Response) {
  const data = await sellerService.applySeller(req.user!.id, req.body);
  return successResponse(res, "Đã ghi nhan yêu cầu seller", data, 201);
}

export async function me(req: Request, res: Response) {
  const data = await sellerService.getMySellerProfile(req.user!.id);
  return successResponse(res, "Trạng thái seller", data);
}

export async function updateProfile(req: Request, res: Response) {
  const data = await sellerService.updateSellerProfile(req.user!.id, req.body);
  return successResponse(res, "Cập nhật hồ sơ shop thành công", data);
}

export async function dashboard(req: Request, res: Response) {
  const data = await sellerService.getSellerDashboard(req.sellerProfile!.id);
  return successResponse(res, "Thống kê seller", data);
}

export async function products(req: Request, res: Response) {
  const data = await sellerService.listSellerProducts(req.sellerProfile!.id, req.query);
  return successResponse(res, "Danh sách sản phẩm shop", data);
}

export async function createProduct(req: Request, res: Response) {
  const data = await sellerService.createSellerProduct(req.sellerProfile!.id, req.body);
  return successResponse(res, "Sản phẩm đã được gửi cho admin duyệt", data, 201);
}

export async function productDetail(req: Request, res: Response) {
  const data = await sellerService.getSellerProduct(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Chi tiết sản phẩm shop", data);
}

export async function updateProduct(req: Request, res: Response) {
  const data = await sellerService.updateSellerProduct(req.sellerProfile!.id, Number(req.params.id), req.body);
  return successResponse(res, "Cập nhật sản phẩm thành công", data);
}

export async function deleteProduct(req: Request, res: Response) {
  const data = await sellerService.hideSellerProduct(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Đã an sản phẩm", data);
}

export async function submitProduct(req: Request, res: Response) {
  const data = await sellerService.submitSellerProduct(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Đã gửi sản phẩm để duyệt", data);
}

export async function orders(req: Request, res: Response) {
  const data = await sellerService.listSellerOrders(req.sellerProfile!.id);
  return successResponse(res, "Đơn hàng của shop", data);
}

export async function orderDetail(req: Request, res: Response) {
  const data = await sellerService.getSellerOrder(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Chi tiết đơn hàng của shop", data);
}

export async function updateOrderStatus(req: Request, res: Response) {
  const data = await sellerService.updateSellerSubOrderStatus(req.sellerProfile!.id, Number(req.params.id), req.body);
  return successResponse(res, "Cập nhật trạng thái đơn hàng thành công", data);
}

export async function adminSellers(req: Request, res: Response) {
  const data = await sellerService.listAdminSellers(req.query);
  return successResponse(res, "Danh sách seller", data);
}

export async function adminSellerDetail(req: Request, res: Response) {
  const data = await sellerService.getAdminSeller(Number(req.params.id));
  return successResponse(res, "Chi tiết seller", data);
}

export async function approveSeller(req: Request, res: Response) {
  const data = await sellerService.approveSeller(Number(req.params.id));
  return successResponse(res, "Duyệt seller thành công", data);
}

export async function rejectSeller(req: Request, res: Response) {
  const data = await sellerService.rejectSeller(Number(req.params.id), String(req.body.rejectReason || ""));
  return successResponse(res, "Từ chối seller thành công", data);
}

export async function suspendSeller(req: Request, res: Response) {
  const data = await sellerService.suspendSeller(Number(req.params.id));
  return successResponse(res, "Đã tạm khóa seller", data);
}

export async function reactivateSeller(req: Request, res: Response) {
  const data = await sellerService.reactivateSeller(Number(req.params.id));
  return successResponse(res, "Đã mở khóa seller", data);
}
