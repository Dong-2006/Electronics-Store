import { Prisma, ProductApprovalStatus } from "@prisma/client";
import { prisma } from "../prisma/client";
import { createNotification } from "./notification.service";

function listQuery(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

export async function listProductApprovals(query: Record<string, unknown>) {
  const { page, limit, skip } = listQuery(query);
  const where: Prisma.ProductWhereInput = {};
  if (query.approvalStatus) where.approvalStatus = query.approvalStatus as ProductApprovalStatus;
  if (query.sellerId) where.sellerId = Number(query.sellerId);
  if (query.search) {
    where.OR = [
      { name: { contains: String(query.search) } },
      { description: { contains: String(query.search) } }
    ];
  }

  const include = {
    category: true,
    brand: true,
    seller: { include: { user: { select: { id: true, name: true, email: true } } } },
    specifications: true
  } satisfies Prisma.ProductInclude;

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, include, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.product.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getProductApproval(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      seller: { include: { user: { select: { id: true, name: true, email: true } } } },
      specifications: true
    }
  });
  if (!product) throw new Error("Khong tim thay san pham");
  return product;
}

export async function approveProduct(id: number, adminId: number) {
  const product = await prisma.product.update({
    where: { id },
    data: {
      approvalStatus: "APPROVED",
      isActive: true,
      approvedAt: new Date(),
      approvedById: adminId,
      rejectReason: null
    },
    include: { seller: true }
  });
  if (product.seller) {
    await createNotification({
      userId: product.seller.userId,
      title: "San pham da duoc duyet",
      message: `${product.name} da duoc hien thi tren cua hang`,
      type: "SYSTEM_ALERT",
      metadata: { productId: product.id, url: `/seller/products/${product.id}/edit` }
    });
  }
  return product;
}

export async function rejectProduct(id: number, rejectReason: string) {
  const product = await prisma.product.update({
    where: { id },
    data: {
      approvalStatus: "REJECTED",
      isActive: false,
      rejectReason
    },
    include: { seller: true }
  });
  if (product.seller) {
    await createNotification({
      userId: product.seller.userId,
      title: "San pham bi tu choi",
      message: rejectReason || `${product.name} can chinh sua truoc khi duyet`,
      type: "SYSTEM_ALERT",
      metadata: { productId: product.id, url: `/seller/products/${product.id}/edit` }
    });
  }
  return product;
}
