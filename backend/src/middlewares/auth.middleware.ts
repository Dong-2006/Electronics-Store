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
      return errorResponse(res, "Tài khoản không tồn tại hoặc đã bị khóa", 401);
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch {
    return errorResponse(res, "Token không hợp lệ", 401);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return errorResponse(res, "Bạn không có quyền truy cập", 403);
  }
  next();
}
