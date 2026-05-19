import { z } from "zod";
import { prisma } from "../prisma/client";

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
  orderItemId: z.coerce.number().int().positive().optional(),
  images: z.array(z.string()).optional()
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
      ...(data.orderItemId ? { id: data.orderItemId } : {}),
      order: { userId },
      OR: [{ subOrder: { status: "DELIVERED" } }, { order: { status: "DELIVERED" } }]
    }
  });
  if (!purchased) throw new Error("Ban chi co the danh gia san pham da giao thanh cong");

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      orderItemId: purchased.id,
      rating: data.rating,
      comment: data.comment,
      images: data.images || [],
      isVerified: true
    },
    include: { user: { select: { id: true, name: true } } }
  });

  await refreshProductRating(productId);
  return review;
}

export async function deleteReview(userId: number, reviewId: number, isAdmin: boolean) {
  const review = await prisma.review.findFirst({ where: { id: reviewId, ...(isAdmin ? {} : { userId }) } });
  if (!review) return;
  await prisma.review.delete({ where: { id: review.id } });
  await refreshProductRating(review.productId);
}

async function refreshProductRating(productId: number) {
  const result = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true } });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: result._avg.rating || 0 }
  });
}
