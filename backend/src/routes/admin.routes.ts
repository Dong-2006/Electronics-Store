import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as orderController from "../controllers/order.controller";
import { authenticateUser, requireAdmin } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const adminRouter = Router();

adminRouter.use(authenticateUser, requireAdmin);
adminRouter.get("/dashboard/stats", asyncHandler(adminController.stats));
adminRouter.get("/dashboard/revenue", asyncHandler(adminController.revenue));
adminRouter.get("/dashboard/best-selling-products", asyncHandler(adminController.bestSellingProducts));
adminRouter.get("/orders", asyncHandler(orderController.adminOrders));
adminRouter.put("/orders/:id/status", asyncHandler(orderController.updateStatus));
