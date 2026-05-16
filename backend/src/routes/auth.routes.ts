import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.get("/me", authenticateUser, asyncHandler(authController.me));
