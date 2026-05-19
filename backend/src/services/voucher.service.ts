import { Prisma, VoucherType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma/client";

const voucherSchema = z.object({
  code: z.string().min(2).transform((value) => value.trim().toUpperCase()),
  type: z.nativeEnum(VoucherType),
  value: z.coerce.number().min(0),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  usageLimit: z.coerce.number().int().positive(),
  isActive: z.boolean().optional()
});

function validateDateRange(startDate: Date, endDate: Date) {
  if (startDate >= endDate) throw new Error("Ngay bat dau phai nho hon ngay ket thuc");
}

export async function listSellerVouchers(sellerId: number) {
  return prisma.voucher.findMany({ where: { sellerId }, orderBy: { createdAt: "desc" } });
}

export async function createSellerVoucher(sellerId: number, input: unknown) {
  const data = voucherSchema.parse(input);
  validateDateRange(data.startDate, data.endDate);
  if (data.type === "PERCENT" && data.value > 100) throw new Error("Voucher phan tram khong duoc lon hon 100");
  return prisma.voucher.create({ data: { ...data, sellerId } });
}

export async function updateSellerVoucher(sellerId: number, id: number, input: unknown) {
  await ensureVoucherOwner(sellerId, id);
  const data = voucherSchema.partial().parse(input);
  if (data.startDate && data.endDate) validateDateRange(data.startDate, data.endDate);
  if (data.type === "PERCENT" && data.value && data.value > 100) throw new Error("Voucher phan tram khong duoc lon hon 100");
  return prisma.voucher.update({ where: { id }, data });
}

export async function deleteSellerVoucher(sellerId: number, id: number) {
  await ensureVoucherOwner(sellerId, id);
  await prisma.voucher.delete({ where: { id } });
  return { ok: true };
}

export async function toggleSellerVoucher(sellerId: number, id: number, isActive: boolean) {
  await ensureVoucherOwner(sellerId, id);
  return prisma.voucher.update({ where: { id }, data: { isActive } });
}

export async function findApplicableVoucher(tx: Prisma.TransactionClient, sellerId: number, code?: string) {
  if (!code) return null;
  const now = new Date();
  const voucher = await tx.voucher.findFirst({
    where: {
      sellerId,
      code: code.trim().toUpperCase(),
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    }
  });
  return voucher && voucher.usedCount < voucher.usageLimit ? voucher : null;
}

export function calculateDiscount(voucher: { type: VoucherType; value: Prisma.Decimal | number; minOrderValue: Prisma.Decimal | number; maxDiscount: Prisma.Decimal | number | null }, subTotal: number) {
  if (subTotal < Number(voucher.minOrderValue)) return 0;
  if (voucher.type === "FREE_SHIP") return 0;
  if (voucher.type === "FIXED") return Math.min(Number(voucher.value), subTotal);
  const raw = (subTotal * Number(voucher.value)) / 100;
  return Math.min(raw, voucher.maxDiscount ? Number(voucher.maxDiscount) : raw, subTotal);
}

async function ensureVoucherOwner(sellerId: number, id: number) {
  const voucher = await prisma.voucher.findFirst({ where: { id, sellerId } });
  if (!voucher) throw new Error("Khong tim thay voucher");
}
