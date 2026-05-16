import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticateUser, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const userRouter = Router();

userRouter.use(authenticateUser, requireAdmin);
userRouter.get("/", asyncHandler(userController.list));
userRouter.put("/:id/status", asyncHandler(userController.updateStatus));
userRouter.delete("/:id", asyncHandler(userController.remove));
