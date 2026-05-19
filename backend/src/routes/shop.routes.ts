import { Router } from "express";
import * as shopController from "../controllers/shop.controller";
import { asyncHandler } from "../utils/async-handler";

export const shopRouter = Router();

shopRouter.get("/:slug", asyncHandler(shopController.detail));
