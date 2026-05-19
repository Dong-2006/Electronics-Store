import { Request, Response } from "express";
import * as shopService from "../services/shop.service";
import { successResponse } from "../utils/response";

export async function detail(req: Request, res: Response) {
  const data = await shopService.getPublicShop(req.params.slug, req.query);
  return successResponse(res, "Chi tiet shop", data);
}
