import { z } from "zod";
import { prisma } from "../prisma/client";

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional()
});

export async function getProductReviews(productId: number) {
  return prisma.review.findMany({
    where: { productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function createReview(userId: number, productId: number, input: unknown) {
  const data = reviewSchema.parse(input);
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: { in: ["CONFIRMED", "SHIPPING", "DELIVERED"] } }
    }
  });
  if (!purchased) throw new Error("Bạn chỉ có thể đánh giá sản phẩm đã mua");

  return prisma.review.create({
    data: { userId, productId, rating: data.rating, comment: data.comment },
    include: { user: { select: { id: true, name: true } } }
  });
}

export async function deleteReview(userId: number, reviewId: number, isAdmin: boolean) {
  await prisma.review.deleteMany({ where: { id: reviewId, ...(isAdmin ? {} : { userId }) } });
}
