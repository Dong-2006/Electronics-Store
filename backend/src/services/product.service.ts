import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { slugify } from "../utils/slug";

const specificationSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1)
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().min(5),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  image: z.string().url().or(z.string().min(1)),
  images: z.array(z.string()).optional(),
  categoryId: z.coerce.number().int().positive(),
  brandId: z.coerce.number().int().positive(),
  warrantyMonths: z.coerce.number().int().min(0).default(12),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  specifications: z.array(specificationSchema).optional()
});

export async function listProducts(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 50);
  const skip = (page - 1) * limit;
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (query.search) {
    where.OR = [
      { name: { contains: String(query.search) } },
      { description: { contains: String(query.search) } }
    ];
  }

  if (query.category) {
    const categoryValue = String(query.category);
    where.category = /^\d+$/.test(categoryValue)
      ? { id: Number(categoryValue) }
      : { slug: categoryValue };
  }

  if (query.brand) {
    const brandValue = String(query.brand);
    where.brand = /^\d+$/.test(brandValue) ? { id: Number(brandValue) } : { slug: brandValue };
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = Number(query.minPrice);
    if (query.maxPrice) where.price.lte = Number(query.maxPrice);
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (query.sort === "price_asc") orderBy = { price: "asc" };
  if (query.sort === "price_desc") orderBy = { price: "desc" };
  if (query.sort === "newest") orderBy = { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, specifications: true },
      orderBy,
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getProductById(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      specifications: true,
      reviews: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } }
    }
  });
  if (!product) throw new Error("Không tìm thấy sản phẩm");

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    include: { category: true, brand: true },
    take: 4
  });

  return { product, related };
}

export async function createProduct(input: unknown) {
  const data = productSchema.parse(input);
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice || null,
      stock: data.stock,
      image: data.image,
      images: data.images || [],
      categoryId: data.categoryId,
      brandId: data.brandId,
      warrantyMonths: data.warrantyMonths,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
      specifications: {
        create: data.specifications || []
      }
    },
    include: { category: true, brand: true, specifications: true }
  });
}

export async function updateProduct(id: number, input: unknown) {
  const data = productSchema.partial().parse(input);
  return prisma.$transaction(async (tx) => {
    if (data.specifications) {
      await tx.productSpecification.deleteMany({ where: { productId: id } });
    }

    return tx.product.update({
      where: { id },
      data: {
        ...data,
        slug: data.slug || (data.name ? slugify(data.name) : undefined),
        discountPrice: data.discountPrice === undefined ? undefined : data.discountPrice,
        specifications: data.specifications ? { create: data.specifications } : undefined
      },
      include: { category: true, brand: true, specifications: true }
    });
  });
}

export async function deleteProduct(id: number) {
  await prisma.product.update({ where: { id }, data: { isActive: false } });
}
