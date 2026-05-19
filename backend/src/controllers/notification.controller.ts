import { NotificationType } from "@prisma/client";
import { Request, Response } from "express";
import * as notificationService from "../services/notification.service";
import { errorResponse, successResponse } from "../utils/response";

export async function list(req: Request, res: Response) {
  const data = await notificationService.listNotifications(req.user!.id, req.query);
  return successResponse(res, "Danh sach thong bao", data);
}

export async function stream(req: Request, res: Response) {
  const token = String(req.query.token || "");
  const decoded = notificationService.verifyStreamToken(token);
  if (!decoded) return errorResponse(res, "Token khong hop le", 401);
  notificationService.addNotificationStream(decoded.id, res);
}

export async function markRead(req: Request, res: Response) {
  const data = await notificationService.markNotificationRead(req.user!.id, Number(req.params.id));
  return successResponse(res, "Da danh dau da doc", data);
}

export async function markAllRead(req: Request, res: Response) {
  const data = await notificationService.markAllNotificationsRead(req.user!.id);
  return successResponse(res, "Da danh dau tat ca da doc", data);
}

export async function broadcast(req: Request, res: Response) {
  const data = await notificationService.broadcastNotification({
    title: String(req.body.title || ""),
    message: String(req.body.message || ""),
    type: (req.body.type || "SYSTEM_ALERT") as NotificationType,
    targetRole: req.body.targetRole || "ALL"
  });
  return successResponse(res, "Da gui thong bao", data, 201);
}
