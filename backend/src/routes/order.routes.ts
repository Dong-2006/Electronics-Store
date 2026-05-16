import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const orderRouter = Router();

orderRouter.use(authenticateUser);
orderRouter.post("/", asyncHandler(orderController.create));
orderRouter.get("/my-orders", asyncHandler(orderController.myOrders));
orderRouter.get("/:id", asyncHandler(orderController.detail));
