import { Prisma, ProductApprovalStatus } from "@prisma/client";
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
  approvalStatus: z.nativeEnum(ProductApprovalStatus).optional(),
  specifications: z.array(specificationSchema).optional()
});

export const publicProductWhere: Prisma.ProductWhereInput = {
  isActive: true,
  approvalStatus: "APPROVED",
  OR: [{ sellerId: null }, { seller: { status: "APPROVED" } }]
};

const productInclude = {
  category: true,
  brand: true,
  seller: { include: { user: { select: { id: true, name: true, email: true } } } },
  approvedBy: { select: { id: true, name: true, email: true } },
  specifications: true
} satisfies Prisma.ProductInclude;

function buildProductWhere(query: Record<string, unknown>, base: Prisma.ProductWhereInput) {
  const where: Prisma.ProductWhereInput = Object.keys(base).length ? { AND: [base] } : {};

  if (query.search) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      {
        OR: [
          { name: { contains: String(query.search) } },
          { description: { contains: String(query.search) } }
        ]
      }
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

  if (query.approvalStatus) where.approvalStatus = query.approvalStatus as ProductApprovalStatus;

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = Number(query.minPrice);
    if (query.maxPrice) where.price.lte = Number(query.maxPrice);
  }

  return where;
}

function getPagination(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function getOrderBy(query: Record<string, unknown>): Prisma.ProductOrderByWithRelationInput {
  if (query.sort === "price_asc") return { price: "asc" };
  if (query.sort === "price_desc") return { price: "desc" };
  return { createdAt: "desc" };
}

export async function listProducts(query: Record<string, unknown>) {
  const { page, limit, skip } = getPagination(query);
  const where = buildProductWhere(query, publicProductWhere);
  const orderBy = getOrderBy(query);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function listAdminProducts(query: Record<string, unknown>) {
  const { page, limit, skip } = getPagination(query);
  const where = buildProductWhere(query, {});
  const orderBy = getOrderBy(query);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getProductById(id: number) {
  const product = await prisma.product.findFirst({
    where: { id, ...publicProductWhere },
    include: {
      ...productInclude,
      reviews: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } }
    }
  });
  if (!product) throw new Error("Khong tim thay san pham");

  const related = await prisma.product.findMany({
    where: { ...publicProductWhere, categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true, brand: true },
    take: 4
  });

  return { product, related };
}

export async function createProduct(input: unknown, adminId?: number) {
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
      approvalStatus: "APPROVED",
      approvedAt: new Date(),
      approvedById: adminId,
      specifications: {
        create: data.specifications || []
      }
    },
    include: productInclude
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
        name: data.name,
        slug: data.slug || (data.name ? slugify(data.name) : undefined),
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice === undefined ? undefined : data.discountPrice,
        stock: data.stock,
        image: data.image,
        images: data.images,
        categoryId: data.categoryId,
        brandId: data.brandId,
        warrantyMonths: data.warrantyMonths,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        approvalStatus: data.approvalStatus,
        specifications: data.specifications ? { create: data.specifications } : undefined
      },
      include: productInclude
    });
  });
}

export async function deleteProduct(id: number) {
  await prisma.product.update({ where: { id }, data: { isActive: false } });
}
