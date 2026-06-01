import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { createNotification } from "./notification.service";
import { publicProductWhere } from "./product.service";
import { calculateDiscount, findApplicableVoucher } from "./voucher.service";

export const orderSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  address: z.string().min(5),
  note: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).default("COD"),
  vouchers: z.array(z.object({ sellerId: z.coerce.number().int().positive(), code: z.string().min(1) })).optional()
});

export async function createOrder(userId: number, input: unknown) {
  const data = orderSchema.parse(input);
  const sellerNotifications: Array<{ userId: number; title: string; message: string; orderId: number; subOrderId: number }> = [];
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { seller: { include: { user: true } } } } } } }
  });
  if (!cart || cart.items.length === 0) throw new Error("Giỏ hàng đang trống");

  const order = await prisma.$transaction(async (tx) => {
    const voucherCodes = new Map((data.vouchers || []).map((voucher) => [voucher.sellerId, voucher.code]));
    const groups = new Map<string, typeof cart.items>();

    for (const item of cart.items) {
      const publicProduct = await tx.product.findFirst({
        where: { id: item.productId, ...publicProductWhere }
      });
      if (!publicProduct) throw new Error(`${item.product.name} không con ban`);
      if (item.product.stock < item.quantity) throw new Error(`${item.product.name} không du ton kho`);

      const groupKey = item.product.sellerId ? String(item.product.sellerId) : "platform";
      groups.set(groupKey, [...(groups.get(groupKey) || []), item]);
    }

    const subOrderDrafts = [];
    let totalAmount = 0;
    for (const [groupKey, items] of groups.entries()) {
      const sellerId = groupKey === "platform" ? null : Number(groupKey);
      const subTotal = items.reduce((sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity, 0);
      const voucher = sellerId ? await findApplicableVoucher(tx, sellerId, voucherCodes.get(sellerId)) : null;
      const discountAmount = voucher ? calculateDiscount(voucher, subTotal) : 0;
      totalAmount += subTotal - discountAmount;
      subOrderDrafts.push({ sellerId, items, subTotal, voucher, discountAmount });
    }

    const order = await tx.order.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        note: data.note,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "COD" ? PaymentStatus.PAID : PaymentStatus.PENDING,
        totalAmount
      }
    });

    for (const draft of subOrderDrafts) {
      const subOrder = await tx.subOrder.create({
        data: {
          orderId: order.id,
          sellerId: draft.sellerId,
          subTotal: draft.subTotal,
          voucherId: draft.voucher?.id,
          discountAmount: draft.discountAmount,
          status: "PROCESSING"
        }
      });

      if (draft.voucher) {
        await tx.voucher.update({ where: { id: draft.voucher.id }, data: { usedCount: { increment: 1 } } });
      }

      for (const item of draft.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            subOrderId: subOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.product.discountPrice || item.product.price)
          }
        });
        const updateResult = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } }
        });

        if (updateResult.count === 0) {
          throw new Error(`Sản phẩm ${item.product.name} không đủ tồn kho (có thể do người khác vừa mua)`);
        }
      }

      if (draft.sellerId && draft.items[0]?.product.seller?.userId) {
        sellerNotifications.push({
          userId: draft.items[0].product.seller.userId,
          title: "Đơn hàng moi",
          message: `Shop co đơn hàng #${order.id} moi can xu ly`,
          orderId: order.id,
          subOrderId: subOrder.id
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    const createdOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { product: true } },
        subOrders: { include: { seller: true, voucher: true, items: { include: { product: true } } } }
      }
    });

    return createdOrder;
  });

  await Promise.all(
    sellerNotifications.map((notification) =>
      createNotification({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: "NEW_ORDER",
        metadata: {
          orderId: notification.orderId,
          subOrderId: notification.subOrderId,
          url: `/seller/orders`
        }
      })
    )
  );

  return order;
}

export async function getMyOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      subOrders: { include: { seller: true, voucher: true, items: { include: { product: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getOrderById(userId: number, orderId: number, isAdmin = false) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, ...(isAdmin ? {} : { userId }) },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      subOrders: { include: { seller: true, voucher: true, items: { include: { product: true } } } }
    }
  });
  if (!order) throw new Error("Không tim thay đơn hàng");
  return order;
}

export async function getAllOrders() {
  return prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      subOrders: { include: { seller: true, items: { include: { product: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  return prisma.order.update({ where: { id: orderId }, data: { status } });
}
