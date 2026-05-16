import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const wishlistRouter = Router();

wishlistRouter.use(authenticateUser);
wishlistRouter.get("/", asyncHandler(wishlistController.list));
wishlistRouter.post("/:productId", asyncHandler(wishlistController.add));
wishlistRouter.delete("/:productId", asyncHandler(wishlistController.remove));
