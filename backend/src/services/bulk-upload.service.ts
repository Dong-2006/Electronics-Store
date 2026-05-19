import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { slugify } from "../utils/slug";

const bulkSchema = z.object({
  sellerId: z.coerce.number().int().positive(),
  fileName: z.string().optional(),
  csv: z.string().min(1)
});

type CsvRow = Record<string, string>;

export async function runProductBulkUpload(adminId: number, input: unknown) {
  const data = bulkSchema.parse(input);
  const seller = await prisma.sellerProfile.findFirst({ where: { id: data.sellerId, status: "APPROVED" } });
  if (!seller) throw new Error("Seller không tồn tại hoặc chưa được duyệt");

  const rows = parseCsv(data.csv);
  if (!rows.length) throw new Error("File CSV không có dữ liệu");

  return prisma.$transaction(async (tx) => {
    const batch = await tx.bulkUploadBatch.create({
      data: { sellerId: data.sellerId, uploadedBy: adminId, fileName: data.fileName, itemCount: rows.length }
    });

    let errorCount = 0;
    for (const [index, row] of rows.entries()) {
      const result = await upsertBulkProduct(tx, data.sellerId, row);
      if (result.errorDescription) errorCount += 1;
      await tx.bulkUploadItem.create({
        data: {
          batchId: batch.id,
          rowNumber: index + 2,
          name: row.title || row.name || "",
          slug: row.slug || slugify(row.title || row.name || ""),
          price: Number(row.price || 0),
          status: result.status,
          errorDescription: result.errorDescription
        }
      });
    }

    return tx.bulkUploadBatch.update({
      where: { id: batch.id },
      data: {
        errorCount,
        status: errorCount === 0 ? "COMPLETED" : errorCount === rows.length ? "FAILED" : "PARTIAL"
      },
      include: { items: true, seller: true }
    });
  });
}

export function listBulkBatches() {
  return prisma.bulkUploadBatch.findMany({
    include: { seller: true, uploader: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export function getBulkBatchErrors(id: number) {
  return prisma.bulkUploadItem.findMany({
    where: { batchId: id, status: "ERROR" },
    orderBy: { rowNumber: "asc" }
  });
}

async function upsertBulkProduct(tx: Prisma.TransactionClient, sellerId: number, row: CsvRow) {
  try {
    const name = row.title || row.name;
    const slug = row.slug || slugify(name || "");
    const price = Number(row.price || 0);
    const stock = Number(row.inStock || row.stock || 0);
    const category = await findCategory(tx, row.categorySlug || row.categoryId);
    const brand = await findBrand(tx, row.brandSlug || row.brandId || row.manufacturer);

    if (!name) throw new Error("Thiếu ten sản phẩm");
    if (!slug) throw new Error("Thiếu slug");
    if (!price || price <= 0) throw new Error("Giá phải lớn hơn 0");
    if (!category) throw new Error("Danh mục không tồn tại");
    if (!brand) throw new Error("Thương hiệu không tồn tại");
    if (!row.mainImage && !row.image) throw new Error("Thiếu anh chinh");

    const specs = parseSpecs(row.specs);
    const existing = await tx.product.findUnique({ where: { slug } });
    const payload = {
      name,
      slug,
      description: row.description || name,
      price,
      discountPrice: row.salePrice || row.discountPrice ? Number(row.salePrice || row.discountPrice) : null,
      stock,
      image: row.mainImage || row.image,
      images: row.images ? row.images.split("|").map((item) => item.trim()).filter(Boolean) : [],
      categoryId: category.id,
      brandId: brand.id,
      warrantyMonths: Number(row.warrantyMonths || 12),
      sellerId,
      approvalStatus: "APPROVED" as const,
      isActive: true,
      approvedAt: new Date()
    };

    if (existing) {
      if (existing.sellerId !== sellerId) throw new Error("Slug đã tồn tại ở shop khác");
      await tx.productSpecification.deleteMany({ where: { productId: existing.id } });
      await tx.product.update({
        where: { id: existing.id },
        data: { ...payload, specifications: { create: specs } }
      });
      return { status: "UPDATED" as const };
    }

    await tx.product.create({ data: { ...payload, specifications: { create: specs } } });
    return { status: "CREATED" as const };
  } catch (error) {
    return { status: "ERROR" as const, errorDescription: error instanceof Error ? error.message : "Lỗi không xac dinh" };
  }
}

async function findCategory(tx: Prisma.TransactionClient, value?: string) {
  if (!value) return null;
  return /^\d+$/.test(value)
    ? tx.category.findUnique({ where: { id: Number(value) } })
    : tx.category.findUnique({ where: { slug: value } });
}

async function findBrand(tx: Prisma.TransactionClient, value?: string) {
  if (!value) return null;
  if (/^\d+$/.test(value)) return tx.brand.findUnique({ where: { id: Number(value) } });
  const slug = slugify(value);
  return tx.brand.findFirst({ where: { OR: [{ slug: value }, { slug }, { name: value }] } });
}

function parseSpecs(value?: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Object.entries(parsed).map(([key, specValue]) => ({ key, value: String(specValue) }));
  } catch {
    return [];
  }
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = values[index]?.trim() || "";
      return row;
    }, {});
  });
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}
