import { Prisma, ProductApprovalStatus, SellerStatus, SubOrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { slugify } from "../utils/slug";
import { createNotification } from "./notification.service";
import { productSchema } from "./product.service";

const sellerApplySchema = z.object({
  shopName: z.string().min(2),
  shopDescription: z.string().optional().nullable(),
  shopLogo: z.string().optional().nullable(),
  shopBanner: z.string().optional().nullable(),
  businessPhone: z.string().min(8),
  businessEmail: z.string().email(),
  pickupAddress: z.string().min(5)
});

const sellerProfileUpdateSchema = sellerApplySchema.partial();

const subOrderStatusSchema = z.object({
  status: z.nativeEnum(SubOrderStatus),
  trackingNumber: z.string().optional().nullable(),
  cancelReason: z.string().optional().nullable()
});

function listQuery(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

async function uniqueShopSlug(shopName: string) {
  const base = slugify(shopName);
  let slug = base;
  let index = 1;
  while (await prisma.sellerProfile.findUnique({ where: { shopSlug: slug } })) {
    slug = `${base}-${index++}`;
  }
  return slug;
}

export async function applySeller(userId: number, input: unknown) {
  const existing = await prisma.sellerProfile.findUnique({ where: { userId } });
  const data = sellerApplySchema.parse(input);

  if (existing && existing.status !== "REJECTED") return existing;

  if (existing?.status === "REJECTED") {
    const updated = await prisma.sellerProfile.update({
      where: { id: existing.id },
      data: {
        ...data,
        shopSlug: await uniqueShopSlug(data.shopName),
        status: "PENDING",
        rejectReason: null
      }
    });
    await notifyAdmins("Seller đăng ký lai", `Shop ${updated.shopName} vừa gửi lai hồ sơ seller`, { sellerId: updated.id });
    return updated;
  }

  const created = await prisma.sellerProfile.create({
    data: {
      ...data,
      userId,
      shopSlug: await uniqueShopSlug(data.shopName)
    }
  });
  await notifyAdmins("Seller moi cho duyệt", `Shop ${created.shopName} vừa gửi hồ sơ seller`, { sellerId: created.id });
  return created;
}

export function getMySellerProfile(userId: number) {
  return prisma.sellerProfile.findUnique({ where: { userId } });
}

export async function updateSellerProfile(userId: number, input: unknown) {
  const data = sellerProfileUpdateSchema.parse(input);
  return prisma.sellerProfile.update({
    where: { userId },
    data
  });
}

export async function listSellerProducts(sellerId: number, query: Record<string, unknown>) {
  const { page, limit, skip } = listQuery(query);
  const where: Prisma.ProductWhereInput = { sellerId };

  if (query.approvalStatus) where.approvalStatus = query.approvalStatus as ProductApprovalStatus;
  if (query.search) {
    where.OR = [
      { name: { contains: String(query.search) } },
      { description: { contains: String(query.search) } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, specifications: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function createSellerProduct(sellerId: number, input: unknown) {
  const data = productSchema
    .omit({ isFeatured: true, isActive: true, approvalStatus: true })
    .parse(input);

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
      sellerId,
      approvalStatus: "PENDING",
      rejectReason: null,
      isActive: false,
      specifications: { create: data.specifications || [] }
    },
    include: { category: true, brand: true, specifications: true, seller: true }
  });
}

export async function getSellerProduct(sellerId: number, productId: number) {
  const product = await prisma.product.findFirst({
    where: { id: productId, sellerId },
    include: { category: true, brand: true, specifications: true, seller: true }
  });
  if (!product) throw new Error("Không tim thay sản phẩm của shop");
  return product;
}

export async function updateSellerProduct(sellerId: number, productId: number, input: unknown) {
  const current = await getSellerProduct(sellerId, productId);
  const data = productSchema
    .omit({ isFeatured: true, isActive: true, approvalStatus: true })
    .partial()
    .parse(input);

  return prisma.$transaction(async (tx) => {
    if (data.specifications) await tx.productSpecification.deleteMany({ where: { productId } });

    const shouldResubmit =
      current.approvalStatus === "APPROVED" || current.approvalStatus === "REJECTED";

    return tx.product.update({
      where: { id: productId },
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
        approvalStatus: shouldResubmit ? "PENDING" : undefined,
        isActive: shouldResubmit ? false : undefined,
        rejectReason: shouldResubmit ? null : undefined,
        approvedAt: shouldResubmit ? null : undefined,
        approvedById: shouldResubmit ? null : undefined,
        specifications: data.specifications ? { create: data.specifications } : undefined
      },
      include: { category: true, brand: true, specifications: true, seller: true }
    });
  });
}

export async function hideSellerProduct(sellerId: number, productId: number) {
  await getSellerProduct(sellerId, productId);
  return prisma.product.update({ where: { id: productId }, data: { isActive: false } });
}

export async function submitSellerProduct(sellerId: number, productId: number) {
  await getSellerProduct(sellerId, productId);
  return prisma.product.update({
    where: { id: productId },
    data: {
      approvalStatus: "PENDING",
      rejectReason: null,
      approvedAt: null,
      approvedById: null,
      isActive: false
    }
  });
}

export async function listSellerOrders(sellerId: number) {
  return prisma.subOrder.findMany({
    where: { sellerId },
    include: {
      order: { include: { user: { select: { id: true, name: true, email: true } } } },
      voucher: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getSellerOrder(sellerId: number, subOrderId: number) {
  const subOrder = await prisma.subOrder.findFirst({
    where: { id: subOrderId, sellerId },
    include: {
      order: { include: { user: { select: { id: true, name: true, email: true } } } },
      voucher: true,
      items: { include: { product: true } }
    }
  });
  if (!subOrder) throw new Error("Không tim thay đơn hàng của shop");
  return subOrder;
}

export async function updateSellerSubOrderStatus(sellerId: number, subOrderId: number, input: unknown) {
  const data = subOrderStatusSchema.parse(input);
  const current = await getSellerOrder(sellerId, subOrderId);

  const rank: Record<SubOrderStatus, number> = {
    PROCESSING: 1,
    CONFIRMED: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    REFUND_REQUESTED: 5,
    CANCELLED: 99
  };
  if (current.status === "CANCELLED" || current.status === "DELIVERED") {
    throw new Error("Không thể cập nhật đơn hàng đã kết thúc");
  }
  if (data.status !== "CANCELLED" && rank[data.status] < rank[current.status]) {
    throw new Error("Không thể cập nhật lui trạng thái đơn hàng");
  }
  if (data.status === "SHIPPED" && !data.trackingNumber) throw new Error("Can nhap ma van don");
  if (data.status === "CANCELLED" && !data.cancelReason) throw new Error("Can nhap lý do huy");

  const updated = await prisma.$transaction(async (tx) => {
    if (data.status === "CANCELLED") {
      for (const item of current.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity }, sold: { decrement: item.quantity } }
        });
      }
    }

    const subOrder = await tx.subOrder.update({
      where: { id: subOrderId },
      data: {
        status: data.status,
        trackingNumber: data.trackingNumber,
        cancelReason: data.cancelReason
      },
      include: { order: true, items: { include: { product: true } }, seller: true }
    });

    const siblingStatuses = await tx.subOrder.findMany({
      where: { orderId: subOrder.orderId },
      select: { status: true }
    });
    const nextOrderStatus = deriveOrderStatus(siblingStatuses.map((item) => item.status));
    await tx.order.update({ where: { id: subOrder.orderId }, data: { status: nextOrderStatus } });
    return subOrder;
  });

  await createNotification({
    userId: updated.order.userId,
    title: "Cập nhật đơn hàng",
    message: `Đơn hàng #${updated.orderId} tai ${updated.seller?.shopName || "shop"} đã chuyen sang ${updated.status}`,
    type: "ORDER_UPDATE",
    metadata: {
      orderId: updated.orderId,
      subOrderId: updated.id,
      url: `/orders/${updated.orderId}`
    }
  });

  return updated;
}

export async function getSellerDashboard(sellerId: number) {
  const [totalProducts, pendingProducts, approvedProducts, rejectedProducts, orders] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),
    prisma.product.count({ where: { sellerId, approvalStatus: "PENDING" } }),
    prisma.product.count({ where: { sellerId, approvalStatus: "APPROVED" } }),
    prisma.product.count({ where: { sellerId, approvalStatus: "REJECTED" } }),
    listSellerOrders(sellerId)
  ]);

  return {
    totalProducts,
    pendingProducts,
    approvedProducts,
    rejectedProducts,
    totalOrders: orders.length,
    revenue: orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + Number(order.subTotal) + Number(order.shippingFee) - Number(order.discountAmount), 0)
  };
}

function deriveOrderStatus(statuses: SubOrderStatus[]) {
  if (statuses.every((status) => status === "CANCELLED")) return "CANCELLED";
  if (statuses.every((status) => status === "DELIVERED" || status === "CANCELLED")) return "DELIVERED";
  if (statuses.some((status) => status === "SHIPPED")) return "SHIPPED";
  if (statuses.some((status) => status === "CONFIRMED")) return "CONFIRMED";
  return "PENDING";
}

export async function listAdminSellers(query: Record<string, unknown>) {
  const { page, limit, skip } = listQuery(query);
  const where: Prisma.SellerProfileWhereInput = {};
  if (query.status) where.status = query.status as SellerStatus;
  if (query.search) {
    where.OR = [
      { shopName: { contains: String(query.search) } },
      { businessEmail: { contains: String(query.search) } },
      { user: { email: { contains: String(query.search) } } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.sellerProfile.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true, isActive: true } }, _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.sellerProfile.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getAdminSeller(id: number) {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
      products: { include: { category: true, brand: true } }
    }
  });
  if (!seller) throw new Error("Không tim thay seller");
  return seller;
}

export async function approveSeller(id: number) {
  const seller = await getAdminSeller(id);
  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: seller.userId }, data: { role: "SELLER" } });
    return tx.sellerProfile.update({
      where: { id },
      data: { status: "APPROVED", rejectReason: null }
    });
  });
  await createNotification({
    userId: seller.userId,
    title: "Shop đã được phê duyệt",
    message: `Shop ${seller.shopName} đã san sang bán hàng`,
    type: "SYSTEM_ALERT",
    metadata: { sellerId: seller.id, url: "/seller/dashboard" }
  });
  return updated;
}

export async function rejectSeller(id: number, rejectReason: string) {
  const seller = await getAdminSeller(id);
  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: seller.userId }, data: { role: "USER" } });
    return tx.sellerProfile.update({
      where: { id },
      data: { status: "REJECTED", rejectReason }
    });
  });
  await createNotification({
    userId: seller.userId,
    title: "Hồ sơ seller bi từ chối",
    message: rejectReason || "Admin đã từ chối hồ sơ seller của bạn",
    type: "SYSTEM_ALERT",
    metadata: { sellerId: seller.id, url: "/seller/status" }
  });
  return updated;
}

export function suspendSeller(id: number) {
  return prisma.sellerProfile.update({ where: { id }, data: { status: "SUSPENDED" } });
}

export function reactivateSeller(id: number) {
  return prisma.sellerProfile.update({ where: { id }, data: { status: "APPROVED", rejectReason: null } });
}

async function notifyAdmins(title: string, message: string, metadata: Record<string, number>) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title,
        message,
        type: "SYSTEM_ALERT",
        priority: "HIGH",
        metadata
      })
    )
  );
}
