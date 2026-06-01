import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { slugify } from "../utils/slug";

const MAX_SELLER_CSV_BYTES = 1024 * 1024;
const MAX_SELLER_CSV_ROWS = 500;
const SELLER_REQUIRED_HEADERS = ["name", "description", "price", "stock", "image", "categoryId", "brandId"];
const SELLER_OPTIONAL_HEADERS = ["slug", "discountPrice", "images", "warrantyMonths", "specifications"];
const SELLER_ALLOWED_HEADERS = new Set([...SELLER_REQUIRED_HEADERS, ...SELLER_OPTIONAL_HEADERS]);

const bulkSchema = z.object({
  sellerId: z.coerce.number().int().positive(),
  fileName: z.string().optional(),
  csv: z.string().min(1)
});

const sellerBulkSchema = z.object({
  fileName: z.string().trim().min(1, "Thiếu tên file CSV").max(255),
  csv: z.string().min(1, "File CSV không có dữ liệu")
});

type CsvRow = Record<string, string>;
type ParsedCsvRow = {
  rowNumber: number;
  row: CsvRow;
};
type BulkRowError = {
  rowNumber: number;
  field: string;
  reason: string;
};
type ValidSellerProductRow = {
  rowNumber: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  image: string;
  images: string[];
  categoryId: number;
  brandId: number;
  warrantyMonths: number;
  specifications: Array<{ key: string; value: string }>;
};

export async function runProductBulkUpload(adminId: number, input: unknown) {
  const data = bulkSchema.parse(input);
  const seller = await prisma.sellerProfile.findFirst({ where: { id: data.sellerId, status: "APPROVED" } });
  if (!seller) throw new Error("Seller không tồn tại hoặc chưa được duyệt");

  const parsed = parseCsv(data.csv);
  if (!parsed.records.length) throw new Error("File CSV không có dữ liệu");

  return prisma.$transaction(async (tx) => {
    const batch = await tx.bulkUploadBatch.create({
      data: { sellerId: data.sellerId, uploadedBy: adminId, fileName: data.fileName, itemCount: parsed.records.length }
    });

    let errorCount = 0;
    for (const record of parsed.records) {
      const row = record.row;
      const result = await upsertBulkProduct(tx, data.sellerId, row);
      if (result.errorDescription) errorCount += 1;
      await tx.bulkUploadItem.create({
        data: {
          batchId: batch.id,
          rowNumber: record.rowNumber,
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
        status: errorCount === 0 ? "COMPLETED" : errorCount === parsed.records.length ? "FAILED" : "PARTIAL"
      },
      include: { items: true, seller: true }
    });
  });
}

export async function runSellerProductBulkUpload(userId: number, sellerId: number, input: unknown) {
  const data = sellerBulkSchema.parse(input);
  if (!data.fileName.toLowerCase().endsWith(".csv")) throw new Error("Chỉ hỗ trợ upload file .csv");
  if (Buffer.byteLength(data.csv, "utf8") > MAX_SELLER_CSV_BYTES) {
    throw new Error("File CSV vượt quá giới hạn 1MB");
  }

  const parsed = parseCsv(data.csv);
  validateSellerCsvHeaders(parsed.headers);
  if (!parsed.records.length) throw new Error("File CSV không có dòng sản phẩm hợp lệ");
  if (parsed.records.length > MAX_SELLER_CSV_ROWS) {
    throw new Error(`File CSV chỉ được tối đa ${MAX_SELLER_CSV_ROWS} dòng sản phẩm`);
  }

  const references = await loadSellerBulkReferences(parsed.records);
  const seenSlugs = new Set<string>();
  const rowResults = parsed.records.map((record) => validateSellerProductRow(record, references, seenSlugs));
  const rowErrors = rowResults.flatMap((result) => result.errors);

  return prisma.$transaction(async (tx) => {
    const batch = await tx.bulkUploadBatch.create({
      data: {
        sellerId,
        uploadedBy: userId,
        fileName: data.fileName,
        itemCount: parsed.records.length
      }
    });

    let createdCount = 0;
    const committedErrors: BulkRowError[] = [...rowErrors];

    // Seller imports are partial: valid rows become pending products, invalid rows are logged and skipped.
    for (const result of rowResults) {
      if (!result.data) {
        await createBulkErrorItem(tx, batch.id, result.record, result.errors);
        continue;
      }

      try {
        await tx.product.create({
          data: {
            name: result.data.name,
            slug: result.data.slug,
            description: result.data.description,
            price: result.data.price,
            discountPrice: result.data.discountPrice,
            stock: result.data.stock,
            image: result.data.image,
            images: result.data.images,
            categoryId: result.data.categoryId,
            brandId: result.data.brandId,
            warrantyMonths: result.data.warrantyMonths,
            sellerId,
            approvalStatus: "PENDING",
            rejectReason: null,
            isActive: false,
            approvedAt: null,
            approvedById: null,
            specifications: { create: result.data.specifications }
          }
        });

        createdCount += 1;
        await tx.bulkUploadItem.create({
          data: {
            batchId: batch.id,
            rowNumber: result.data.rowNumber,
            name: result.data.name,
            slug: result.data.slug,
            price: result.data.price,
            status: "CREATED"
          }
        });
      } catch (error) {
        const rowError = {
          rowNumber: result.data.rowNumber,
          field: "slug",
          reason: getPrismaCreateErrorMessage(error)
        };
        committedErrors.push(rowError);
        await createBulkErrorItem(tx, batch.id, result.record, [rowError]);
      }
    }

    const errorRows = new Set(committedErrors.map((error) => error.rowNumber));
    const errorCount = errorRows.size;
    const updatedBatch = await tx.bulkUploadBatch.update({
      where: { id: batch.id },
      data: {
        errorCount,
        status: errorCount === 0 ? "COMPLETED" : errorCount === parsed.records.length ? "FAILED" : "PARTIAL"
      },
      include: { items: true, seller: true }
    });

    return {
      batch: updatedBatch,
      createdCount,
      errorCount,
      errors: committedErrors
    };
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

    if (!name) throw new Error("Thiếu tên sản phẩm");
    if (!slug) throw new Error("Thiếu slug");
    if (!price || price <= 0) throw new Error("Giá phải lớn hơn 0");
    if (!category) throw new Error("Danh mục không tồn tại");
    if (!brand) throw new Error("Thương hiệu không tồn tại");
    if (!row.mainImage && !row.image) throw new Error("Thiếu ảnh chính");

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
    return { status: "ERROR" as const, errorDescription: error instanceof Error ? error.message : "Lỗi không xác định" };
  }
}

async function loadSellerBulkReferences(records: ParsedCsvRow[]) {
  const categoryIds = uniquePositiveIds(records.map((record) => record.row.categoryId));
  const brandIds = uniquePositiveIds(records.map((record) => record.row.brandId));
  const candidateSlugs = Array.from(
    new Set(
      records
        .map((record) => slugify(record.row.slug || record.row.name || ""))
        .filter(Boolean)
    )
  );

  const [categories, brands, products] = await Promise.all([
    prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true } }),
    prisma.brand.findMany({ where: { id: { in: brandIds } }, select: { id: true } }),
    candidateSlugs.length
      ? prisma.product.findMany({ where: { slug: { in: candidateSlugs } }, select: { slug: true } })
      : Promise.resolve([])
  ]);

  return {
    categoryIds: new Set(categories.map((category) => category.id)),
    brandIds: new Set(brands.map((brand) => brand.id)),
    existingSlugs: new Set(products.map((product) => product.slug))
  };
}

function validateSellerProductRow(
  record: ParsedCsvRow,
  references: Awaited<ReturnType<typeof loadSellerBulkReferences>>,
  seenSlugs: Set<string>
): { record: ParsedCsvRow; data?: ValidSellerProductRow; errors: BulkRowError[] } {
  const errors: BulkRowError[] = [];
  const row = record.row;
  const name = row.name.trim();
  const description = row.description.trim();
  const slug = slugify(row.slug || name);
  const price = parseDecimalField(row.price, "price", record.rowNumber, errors, true);
  const discountPrice = parseDecimalField(row.discountPrice, "discountPrice", record.rowNumber, errors, false);
  const stock = parseIntegerField(row.stock, "stock", record.rowNumber, errors, true);
  const categoryId = parseIntegerField(row.categoryId, "categoryId", record.rowNumber, errors, true);
  const brandId = parseIntegerField(row.brandId, "brandId", record.rowNumber, errors, true);
  const warrantyMonths = parseIntegerField(row.warrantyMonths || "12", "warrantyMonths", record.rowNumber, errors, true);
  const images = parseImageList(row.images);
  const specifications = parseSellerSpecs(row.specifications, record.rowNumber, errors);

  if (!name) errors.push(rowError(record.rowNumber, "name", "Tên sản phẩm không được để trống"));
  else if (name.length < 2) errors.push(rowError(record.rowNumber, "name", "Tên sản phẩm phải có ít nhất 2 ký tự"));
  if (!description) errors.push(rowError(record.rowNumber, "description", "Mô tả không được để trống"));
  else if (description.length < 5) errors.push(rowError(record.rowNumber, "description", "Mô tả phải có ít nhất 5 ký tự"));
  if (!slug) errors.push(rowError(record.rowNumber, "slug", "Không tạo được slug từ tên sản phẩm"));
  else if (references.existingSlugs.has(slug)) errors.push(rowError(record.rowNumber, "slug", "Slug đã tồn tại trong hệ thống"));
  else if (seenSlugs.has(slug)) errors.push(rowError(record.rowNumber, "slug", "Slug bị trùng trong file CSV"));
  if (price !== null && discountPrice !== null && discountPrice > price) {
    errors.push(rowError(record.rowNumber, "discountPrice", "Giá khuyến mãi không được lớn hơn giá gốc"));
  }
  if (categoryId !== null && !references.categoryIds.has(categoryId)) {
    errors.push(rowError(record.rowNumber, "categoryId", "Danh mục không tồn tại"));
  }
  if (brandId !== null && !references.brandIds.has(brandId)) {
    errors.push(rowError(record.rowNumber, "brandId", "Thương hiệu không tồn tại"));
  }
  if (!row.image.trim()) {
    errors.push(rowError(record.rowNumber, "image", "Ảnh chính không được để trống"));
  } else if (!isValidImageReference(row.image.trim())) {
    errors.push(rowError(record.rowNumber, "image", "Ảnh chính phải là URL http(s) hoặc đường dẫn nội bộ bắt đầu bằng /"));
  }
  for (const image of images) {
    if (!isValidImageReference(image)) {
      errors.push(rowError(record.rowNumber, "images", `Ảnh phụ không hợp lệ: ${image}`));
    }
  }

  if (errors.length > 0) return { record, errors };

  seenSlugs.add(slug);
  return {
    record,
    errors,
    data: {
      rowNumber: record.rowNumber,
      name,
      slug,
      description,
      price: price ?? 0,
      discountPrice,
      stock: stock ?? 0,
      image: row.image.trim(),
      images,
      categoryId: categoryId ?? 0,
      brandId: brandId ?? 0,
      warrantyMonths: warrantyMonths ?? 12,
      specifications
    }
  };
}

function validateSellerCsvHeaders(headers: string[]) {
  const missing = SELLER_REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`CSV thiếu header bắt buộc: ${missing.join(", ")}`);

  const unsupported = headers.filter((header) => !SELLER_ALLOWED_HEADERS.has(header));
  if (unsupported.length) throw new Error(`CSV có header không được hỗ trợ: ${unsupported.join(", ")}`);
}

function createBulkErrorItem(
  tx: Prisma.TransactionClient,
  batchId: number,
  record: ParsedCsvRow,
  errors: BulkRowError[]
) {
  const row = record.row;
  const slug = slugify(row.slug || row.name || `row-${record.rowNumber}`);
  const price = Number(row.price);

  return tx.bulkUploadItem.create({
    data: {
      batchId,
      rowNumber: record.rowNumber,
      name: row.name || `Row ${record.rowNumber}`,
      slug: slug || `row-${record.rowNumber}`,
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      status: "ERROR",
      errorDescription: errors.map((error) => `${error.field}: ${error.reason}`).join("; ")
    }
  });
}

function getPrismaCreateErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Slug đã tồn tại trong hệ thống";
  }
  return error instanceof Error ? error.message : "Không thể tạo sản phẩm";
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

function parseDecimalField(
  value: string | undefined,
  field: string,
  rowNumber: number,
  errors: BulkRowError[],
  required: boolean
) {
  const raw = value?.trim() || "";
  if (!raw) {
    if (required) errors.push(rowError(rowNumber, field, "Trường này là bắt buộc"));
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    errors.push(rowError(rowNumber, field, "Phải là số hợp lệ"));
    return null;
  }
  if (parsed < 0) {
    errors.push(rowError(rowNumber, field, "Không được nhỏ hơn 0"));
    return null;
  }
  return parsed;
}

function parseIntegerField(
  value: string | undefined,
  field: string,
  rowNumber: number,
  errors: BulkRowError[],
  required: boolean
) {
  const raw = value?.trim() || "";
  if (!raw) {
    if (required) errors.push(rowError(rowNumber, field, "Trường này là bắt buộc"));
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    errors.push(rowError(rowNumber, field, "Phải là số nguyên"));
    return null;
  }
  if (parsed < 0) {
    errors.push(rowError(rowNumber, field, "Không được nhỏ hơn 0"));
    return null;
  }
  if ((field === "categoryId" || field === "brandId") && parsed <= 0) {
    errors.push(rowError(rowNumber, field, "Phải là ID dương"));
    return null;
  }
  return parsed;
}

function parseImageList(value?: string) {
  return (value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSellerSpecs(value: string | undefined, rowNumber: number, errors: BulkRowError[]) {
  const raw = value?.trim();
  if (!raw) return [];

  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const specs = parsed
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const maybeSpec = item as { key?: unknown; value?: unknown };
            const key = String(maybeSpec.key || "").trim();
            const specValue = String(maybeSpec.value || "").trim();
            return key && specValue ? { key, value: specValue } : null;
          })
          .filter((item): item is { key: string; value: string } => Boolean(item));
        if (specs.length !== parsed.length) {
          errors.push(rowError(rowNumber, "specifications", "JSON specifications phải gồm các object có key và value"));
        }
        return specs;
      }
      if (parsed && typeof parsed === "object") {
        return Object.entries(parsed).map(([key, specValue]) => ({ key: key.trim(), value: String(specValue).trim() }));
      }
    } catch {
      errors.push(rowError(rowNumber, "specifications", "JSON specifications không hợp lệ"));
      return [];
    }
  }

  return raw.split("|").flatMap((item) => {
    const separator = item.includes(":") ? ":" : "=";
    const [key, ...rest] = item.split(separator);
    const specKey = key?.trim();
    const specValue = rest.join(separator).trim();
    if (!specKey || !specValue) {
      errors.push(rowError(rowNumber, "specifications", `Thông số không hợp lệ: ${item}`));
      return [];
    }
    return [{ key: specKey, value: specValue }];
  });
}

function isValidImageReference(value: string) {
  if (value.startsWith("/")) return value.length > 1 && !/\s/.test(value);
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function uniquePositiveIds(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );
}

function rowError(rowNumber: number, field: string, reason: string): BulkRowError {
  return { rowNumber, field, reason };
}

function parseCsv(csv: string): { headers: string[]; records: ParsedCsvRow[] } {
  const rows = readCsvRows(csv);
  if (!rows.length) return { headers: [], records: [] };

  const headers = rows[0].values.map((header) => header.trim());
  const duplicateHeaders = headers.filter((header, index) => header && headers.indexOf(header) !== index);
  if (duplicateHeaders.length) throw new Error(`CSV có header bị trùng: ${Array.from(new Set(duplicateHeaders)).join(", ")}`);
  if (headers.some((header) => !header)) throw new Error("CSV có header rỗng");

  const records = rows.slice(1).map((parsedRow) => ({
    rowNumber: parsedRow.rowNumber,
    row: headers.reduce<CsvRow>((row, header, index) => {
      row[header] = parsedRow.values[index]?.trim() || "";
      return row;
    }, {})
  }));

  return { headers, records };
}

function readCsvRows(csv: string) {
  const rows: Array<{ rowNumber: number; values: string[] }> = [];
  const normalized = csv.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let values: string[] = [];
  let current = "";
  let inQuotes = false;
  let rowNumber = 1;
  let lineNumber = 1;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else if (char === "\n" && !inQuotes) {
      values.push(current);
      if (values.some((value) => value.trim())) rows.push({ rowNumber, values });
      values = [];
      current = "";
      lineNumber += 1;
      rowNumber = lineNumber;
    } else {
      current += char;
      if (char === "\n") lineNumber += 1;
    }
  }

  if (inQuotes) throw new Error("CSV có dấu ngoặc kép chưa đóng");
  values.push(current);
  if (values.some((value) => value.trim())) rows.push({ rowNumber, values });
  return rows;
}
