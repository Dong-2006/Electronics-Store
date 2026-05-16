import { Router } from "express";
import * as brandController from "../controllers/brand.controller";
import { authenticateUser, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const brandRouter = Router();

brandRouter.get("/", asyncHandler(brandController.list));
brandRouter.post("/", authenticateUser, requireAdmin, asyncHandler(brandController.create));
brandRouter.put("/:id", authenticateUser, requireAdmin, asyncHandler(brandController.update));
brandRouter.delete("/:id", authenticateUser, requireAdmin, asyncHandler(brandController.remove));
