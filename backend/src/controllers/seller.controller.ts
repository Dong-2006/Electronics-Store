import { Request, Response } from "express";
import * as sellerService from "../services/seller.service";
import { successResponse } from "../utils/response";

export async function apply(req: Request, res: Response) {
  const data = await sellerService.applySeller(req.user!.id, req.body);
  return successResponse(res, "Da ghi nhan yeu cau seller", data, 201);
}

export async function me(req: Request, res: Response) {
  const data = await sellerService.getMySellerProfile(req.user!.id);
  return successResponse(res, "Trang thai seller", data);
}

export async function updateProfile(req: Request, res: Response) {
  const data = await sellerService.updateSellerProfile(req.user!.id, req.body);
  return successResponse(res, "Cap nhat ho so shop thanh cong", data);
}

export async function dashboard(req: Request, res: Response) {
  const data = await sellerService.getSellerDashboard(req.sellerProfile!.id);
  return successResponse(res, "Thong ke seller", data);
}

export async function products(req: Request, res: Response) {
  const data = await sellerService.listSellerProducts(req.sellerProfile!.id, req.query);
  return successResponse(res, "Danh sach san pham shop", data);
}

export async function createProduct(req: Request, res: Response) {
  const data = await sellerService.createSellerProduct(req.sellerProfile!.id, req.body);
  return successResponse(res, "San pham da duoc gui cho admin duyet", data, 201);
}

export async function productDetail(req: Request, res: Response) {
  const data = await sellerService.getSellerProduct(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Chi tiet san pham shop", data);
}

export async function updateProduct(req: Request, res: Response) {
  const data = await sellerService.updateSellerProduct(req.sellerProfile!.id, Number(req.params.id), req.body);
  return successResponse(res, "Cap nhat san pham thanh cong", data);
}

export async function deleteProduct(req: Request, res: Response) {
  const data = await sellerService.hideSellerProduct(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Da an san pham", data);
}

export async function submitProduct(req: Request, res: Response) {
  const data = await sellerService.submitSellerProduct(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Da gui san pham de duyet", data);
}

export async function orders(req: Request, res: Response) {
  const data = await sellerService.listSellerOrders(req.sellerProfile!.id);
  return successResponse(res, "Don hang cua shop", data);
}

export async function orderDetail(req: Request, res: Response) {
  const data = await sellerService.getSellerOrder(req.sellerProfile!.id, Number(req.params.id));
  return successResponse(res, "Chi tiet don hang cua shop", data);
}

export async function updateOrderStatus(req: Request, res: Response) {
  const data = await sellerService.updateSellerSubOrderStatus(req.sellerProfile!.id, Number(req.params.id), req.body);
  return successResponse(res, "Cap nhat trang thai don hang thanh cong", data);
}

export async function adminSellers(req: Request, res: Response) {
  const data = await sellerService.listAdminSellers(req.query);
  return successResponse(res, "Danh sach seller", data);
}

export async function adminSellerDetail(req: Request, res: Response) {
  const data = await sellerService.getAdminSeller(Number(req.params.id));
  return successResponse(res, "Chi tiet seller", data);
}

export async function approveSeller(req: Request, res: Response) {
  const data = await sellerService.approveSeller(Number(req.params.id));
  return successResponse(res, "Duyet seller thanh cong", data);
}

export async function rejectSeller(req: Request, res: Response) {
  const data = await sellerService.rejectSeller(Number(req.params.id), String(req.body.rejectReason || ""));
  return successResponse(res, "Tu choi seller thanh cong", data);
}

export async function suspendSeller(req: Request, res: Response) {
  const data = await sellerService.suspendSeller(Number(req.params.id));
  return successResponse(res, "Da tam khoa seller", data);
}

export async function reactivateSeller(req: Request, res: Response) {
  const data = await sellerService.reactivateSeller(Number(req.params.id));
  return successResponse(res, "Da mo khoa seller", data);
}
