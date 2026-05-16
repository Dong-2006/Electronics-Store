import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth.routes";
import { brandRouter } from "./routes/brand.routes";
import { cartRouter } from "./routes/cart.routes";
import { categoryRouter } from "./routes/category.routes";
import { orderRouter } from "./routes/order.routes";
import { productRouter } from "./routes/product.routes";
import { reviewRouter } from "./routes/review.routes";
import { userRouter } from "./routes/user.routes";
import { wishlistRouter } from "./routes/wishlist.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

dotenv.config();

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ success: true, message: "API is running" }));
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/users", userRouter);

app.use(notFoundHandler);
app.use(errorHandler);
