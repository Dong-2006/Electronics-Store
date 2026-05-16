import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const cartRouter = Router();

cartRouter.use(authenticateUser);
cartRouter.get("/", asyncHandler(cartController.getCart));
cartRouter.post("/items", asyncHandler(cartController.addItem));
cartRouter.put("/items/:id", asyncHandler(cartController.updateItem));
cartRouter.delete("/items/:id", asyncHandler(cartController.removeItem));
cartRouter.delete("/clear", asyncHandler(cartController.clear));
