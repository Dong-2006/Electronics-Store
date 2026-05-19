import { Router } from "express";
import * as sellerController from "../controllers/seller.controller";
import * as voucherController from "../controllers/voucher.controller";
import { authenticateUser, requireApprovedSeller, requireSeller } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const sellerRouter = Router();

sellerRouter.use(authenticateUser);
sellerRouter.post("/apply", asyncHandler(sellerController.apply));
sellerRouter.get("/me", asyncHandler(sellerController.me));
sellerRouter.put("/profile", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.updateProfile));
sellerRouter.get("/dashboard", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.dashboard));
sellerRouter.get("/products", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.products));
sellerRouter.post("/products", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.createProduct));
sellerRouter.get("/products/:id", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.productDetail));
sellerRouter.put("/products/:id", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.updateProduct));
sellerRouter.delete("/products/:id", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.deleteProduct));
sellerRouter.put("/products/:id/submit", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.submitProduct));
sellerRouter.get("/orders", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.orders));
sellerRouter.get("/orders/:id", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.orderDetail));
sellerRouter.put("/orders/:id/status", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(sellerController.updateOrderStatus));
sellerRouter.get("/vouchers", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(voucherController.list));
sellerRouter.post("/vouchers", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(voucherController.create));
sellerRouter.put("/vouchers/:id", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(voucherController.update));
sellerRouter.patch("/vouchers/:id/toggle", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(voucherController.toggle));
sellerRouter.delete("/vouchers/:id", requireSeller, asyncHandler(requireApprovedSeller), asyncHandler(voucherController.remove));
