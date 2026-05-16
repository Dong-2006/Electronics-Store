import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const reviewRouter = Router();

reviewRouter.delete("/:id", authenticateUser, asyncHandler(reviewController.remove));
