import { prisma } from "../prisma/client";

export async function getWishlist(userId: number) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: { product: { include: { category: true, brand: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function addWishlist(userId: number, productId: number) {
  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
    include: { product: true }
  });
}

export async function removeWishlist(userId: number, productId: number) {
  return prisma.wishlist.deleteMany({ where: { userId, productId } });
}
