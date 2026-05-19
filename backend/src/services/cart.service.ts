import { z } from "zod";
import { prisma } from "../prisma/client";
import { publicProductWhere } from "./product.service";

const cartItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().default(1)
});

async function getOrCreateCart(userId: number) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });
}

export async function getCart(userId: number) {
  const cart = await getOrCreateCart(userId);
  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { category: true, brand: true } } } } }
  });
}

export async function addCartItem(userId: number, input: unknown) {
  const data = cartItemSchema.parse(input);
  const product = await prisma.product.findFirst({
    where: { id: data.productId, ...publicProductWhere }
  });
  if (!product) throw new Error("Sản phẩm không tồn tại");
  if (product.stock < data.quantity) throw new Error("Số lượng vượt quá tồn kho");

  const cart = await getOrCreateCart(userId);
  const existed = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: data.productId } }
  });
  const nextQuantity = (existed?.quantity || 0) + data.quantity;
  if (product.stock < nextQuantity) throw new Error("Số lượng vượt quá tồn kho");

  return prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: data.productId } },
    update: { quantity: nextQuantity },
    create: { cartId: cart.id, productId: data.productId, quantity: data.quantity },
    include: { product: true }
  });
}

export async function updateCartItem(userId: number, itemId: number, quantity: number) {
  if (quantity <= 0) throw new Error("Số lượng không hợp lệ");
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: true }
  });
  if (!item) throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
  if (item.product.stock < quantity) throw new Error("Số lượng vượt quá tồn kho");

  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity }, include: { product: true } });
}

export async function removeCartItem(userId: number, itemId: number) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
}

export async function clearCart(userId: number) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
