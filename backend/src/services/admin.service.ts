import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

export async function getDashboardStats() {
  const [totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders, bestSellingProducts] =
    await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
      }),
      getBestSellingProducts()
    ]);

  return {
    totalRevenue: totalRevenue._sum.totalAmount || new Prisma.Decimal(0),
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders,
    bestSellingProducts
  };
}

export async function getRevenue() {
  const rows = await prisma.order.groupBy({
    by: ["status"],
    _sum: { totalAmount: true },
    _count: { id: true }
  });
  return rows;
}

export async function getBestSellingProducts() {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10
  });
  const products = await prisma.product.findMany({
    where: { id: { in: rows.map((row) => row.productId) } },
    include: { category: true, brand: true }
  });

  return rows.map((row) => ({
    product: products.find((product) => product.id === row.productId),
    sold: row._sum.quantity || 0
  }));
}

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateUserStatus(id: number, isActive: boolean) {
  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true }
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
