import { z } from "zod";
import { prisma } from "../prisma/client";
import { slugify } from "../utils/slug";

const catalogSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  parentId: z.coerce.number().int().positive().optional().nullable(),
  logo: z.string().optional().nullable()
});

export async function listCategories() {
  return prisma.category.findMany({
    include: { parent: true, children: { orderBy: { name: "asc" } } },
    orderBy: [{ parentId: "asc" }, { name: "asc" }]
  });
}

export async function createCategory(input: unknown) {
  const data = catalogSchema.parse(input);
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      image: data.image,
      icon: data.icon,
      parentId: data.parentId
    }
  });
}

export async function updateCategory(id: number, input: unknown) {
  const data = catalogSchema.partial().parse(input);
  return prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug || (data.name ? slugify(data.name) : undefined),
      description: data.description,
      image: data.image,
      icon: data.icon,
      parentId: data.parentId
    }
  });
}

export async function deleteCategory(id: number) {
  return prisma.category.delete({ where: { id } });
}

export async function listBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

export async function createBrand(input: unknown) {
  const data = catalogSchema.parse(input);
  return prisma.brand.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      logo: data.logo || data.image
    }
  });
}

export async function updateBrand(id: number, input: unknown) {
  const data = catalogSchema.partial().parse(input);
  return prisma.brand.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug || (data.name ? slugify(data.name) : undefined),
      description: data.description,
      logo: data.logo || data.image
    }
  });
}

export async function deleteBrand(id: number) {
  return prisma.brand.delete({ where: { id } });
}
