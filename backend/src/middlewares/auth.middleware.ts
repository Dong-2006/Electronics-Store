import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../prisma/client";
import { errorResponse } from "../utils/response";

type JwtPayload = {
  id: number;
  email: string;
  role: Role;
};

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return errorResponse(res, "Bạn cần đăng nhập", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret") as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return errorResponse(res, "Tài khoản không tồn tại hoặc đã bị khoa", 401);
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch {
    return errorResponse(res, "Token không hop le", 401);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return errorResponse(res, "Bạn không co quyen truy cap", 403);
  }
  next();
}

export function requireSeller(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "SELLER" && req.user?.role !== "ADMIN") {
    return errorResponse(res, "Bạn cần là seller để thực hiện thao tác này", 403);
  }
  next();
}

export async function requireApprovedSeller(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return errorResponse(res, "Bạn cần đăng nhập", 401);

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: req.user.id }
  });

  if (!sellerProfile || sellerProfile.status !== "APPROVED") {
    return errorResponse(res, "Shop chưa được duyệt hoặc đang bị tạm khóa", 403);
  }

  req.sellerProfile = sellerProfile;
  next();
}
