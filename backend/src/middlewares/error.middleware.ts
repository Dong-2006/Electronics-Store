import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { errorResponse } from "../utils/response";

export function notFoundHandler(req: Request, res: Response) {
  return errorResponse(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return errorResponse(res, error.errors[0]?.message || "Dữ liệu không hợp lệ", 422);
  }

  const message = error instanceof Error ? error.message : "Lỗi server";
  return errorResponse(res, message, 500);
}
