import { Router } from "express";
import * as productController from "../controllers/product.controller";
import * as reviewController from "../controllers/review.controller";
import { authenticateUser, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const productRouter = Router();

productRouter.get("/", asyncHandler(productController.list));
productRouter.get("/:id", asyncHandler(productController.detail));
productRouter.get("/:productId/reviews", asyncHandler(reviewController.list));
productRouter.post("/:productId/reviews", authenticateUser, asyncHandler(reviewController.create));
productRouter.post("/", authenticateUser, requireAdmin, asyncHandler(productController.create));
productRouter.put("/:id", authenticateUser, requireAdmin, asyncHandler(productController.update));
productRouter.delete("/:id", authenticateUser, requireAdmin, asyncHandler(productController.remove));
