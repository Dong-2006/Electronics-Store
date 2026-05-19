import { Router } from "express";
import * as accountController from "../controllers/account.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const accountRouter = Router();

accountRouter.use(authenticateUser);
accountRouter.get("/profile", asyncHandler(accountController.profile));
accountRouter.put("/profile", asyncHandler(accountController.updateProfile));
accountRouter.put("/change-password", asyncHandler(accountController.changePassword));
accountRouter.get("/addresses", asyncHandler(accountController.addresses));
accountRouter.post("/addresses", asyncHandler(accountController.createAddress));
accountRouter.put("/addresses/:id", asyncHandler(accountController.updateAddress));
accountRouter.put("/addresses/:id/default", asyncHandler(accountController.defaultAddress));
accountRouter.delete("/addresses/:id", asyncHandler(accountController.deleteAddress));
