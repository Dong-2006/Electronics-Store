import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { authenticateUser, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(categoryController.list));
categoryRouter.post("/", authenticateUser, requireAdmin, asyncHandler(categoryController.create));
categoryRouter.put("/:id", authenticateUser, requireAdmin, asyncHandler(categoryController.update));
categoryRouter.delete("/:id", authenticateUser, requireAdmin, asyncHandler(categoryController.remove));
