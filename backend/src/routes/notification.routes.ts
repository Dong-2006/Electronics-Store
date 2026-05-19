import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const notificationRouter = Router();

notificationRouter.get("/stream", asyncHandler(notificationController.stream));
notificationRouter.use(authenticateUser);
notificationRouter.get("/", asyncHandler(notificationController.list));
notificationRouter.put("/read-all", asyncHandler(notificationController.markAllRead));
notificationRouter.put("/:id/read", asyncHandler(notificationController.markRead));
