import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma/client";

export const orderSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  address: z.string().min(5),
  note: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).default("COD")
});

export async function createOrder(userId: number, input: unknown) {
  const data = orderSchema.parse(input);
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });
  if (!cart || cart.items.length === 0) throw new Error("Giỏ hàng đang trống");

  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    for (const item of cart.items) {
      if (!item.product.isActive) throw new Error(`${item.product.name} không còn bán`);
      if (item.product.stock < item.quantity) throw new Error(`${item.product.name} không đủ tồn kho`);
      totalAmount += Number(item.product.discountPrice || item.product.price) * item.quantity;
    }

    const order = await tx.order.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        note: data.note,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "COD" ? PaymentStatus.UNPAID : PaymentStatus.UNPAID,
        totalAmount,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.product.discountPrice || item.product.price)
          }))
        }
      },
      include: { items: { include: { product: true } } }
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}

export async function getMyOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function getOrderById(userId: number, orderId: number, isAdmin = false) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, ...(isAdmin ? {} : { userId }) },
    include: { user: { select: { id: true, name: true, email: true } }, items: { include: { product: true } } }
  });
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  return order;
}

export async function getAllOrders() {
  return prisma.order.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  return prisma.order.update({ where: { id: orderId }, data: { status } });
}
