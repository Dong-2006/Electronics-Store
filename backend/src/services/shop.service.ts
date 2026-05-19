import { prisma } from "../prisma/client";
import { publicProductWhere } from "./product.service";

export async function getPublicShop(slug: string, query: Record<string, unknown>) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 50);

  const shop = await prisma.sellerProfile.findFirst({
    where: { shopSlug: slug, status: "APPROVED" },
    include: { user: { select: { id: true, name: true } }, _count: { select: { products: true } } }
  });
  if (!shop) throw new Error("Khong tim thay shop");

  const where = {
    AND: [
      publicProductWhere,
      { sellerId: shop.id },
      ...(query.search
        ? [
            {
              OR: [
                { name: { contains: String(query.search) } },
                { description: { contains: String(query.search) } }
              ]
            }
          ]
        : [])
    ]
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, specifications: true, seller: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return { shop, products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
