import jwt from "jsonwebtoken";
import { NotificationPriority, NotificationType, Prisma } from "@prisma/client";
import { Response } from "express";
import { prisma } from "../prisma/client";

const clients = new Map<number, Set<Response>>();

function sendEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function addNotificationStream(userId: number, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);
  sendEvent(res, "ready", { userId });

  res.on("close", () => {
    clients.get(userId)?.delete(res);
    if (clients.get(userId)?.size === 0) clients.delete(userId);
  });
}

export function verifyStreamToken(token?: string) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "dev_secret") as { id: number };
  } catch {
    return null;
  }
}

export async function createNotification(input: {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  metadata?: Prisma.InputJsonValue;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      priority: input.priority || "NORMAL",
      metadata: input.metadata
    }
  });

  clients.get(input.userId)?.forEach((res) => sendEvent(res, "notification", notification));
  return notification;
}

export async function listNotifications(userId: number, query: Record<string, unknown>) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 50);
  const where = { userId };

  const [items, unreadCount, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.count({ where })
  ]);

  return { items, unreadCount, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function markNotificationRead(userId: number, id: number) {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) throw new Error("Khong tim thay thong bao");
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllNotificationsRead(userId: number) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  return { ok: true };
}

export async function broadcastNotification(input: {
  title: string;
  message: string;
  type: NotificationType;
  targetRole?: "USER" | "SELLER" | "ADMIN" | "ALL";
}) {
  const users = await prisma.user.findMany({
    where: input.targetRole && input.targetRole !== "ALL" ? { role: input.targetRole } : {},
    select: { id: true }
  });

  const created = await Promise.all(
    users.map((user) =>
      createNotification({
        userId: user.id,
        title: input.title,
        message: input.message,
        type: input.type,
        priority: "NORMAL"
      })
    )
  );

  return { count: created.length };
}
