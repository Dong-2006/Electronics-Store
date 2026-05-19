import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma/client";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(8).optional().nullable()
});

const addressSchema = z.object({
  label: z.string().min(1).default("Nha"),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().optional().nullable(),
  country: z.string().min(2).default("Vietnam"),
  isDefault: z.boolean().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

export function getProfile(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true }
  });
}

export async function updateProfile(userId: number, input: unknown) {
  const data = profileSchema.parse(input);
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }
  });
}

export function listAddresses(userId: number) {
  return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
}

async function clearDefaultAddress(userId: number) {
  await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
}

export async function createAddress(userId: number, input: unknown) {
  const data = addressSchema.parse(input);
  const existingCount = await prisma.address.count({ where: { userId } });
  const isDefault = data.isDefault ?? existingCount === 0;

  return prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.create({ data: { ...data, isDefault, userId } });
  });
}

export async function updateAddress(userId: number, id: number, input: unknown) {
  const data = addressSchema.partial().parse(input);
  await ensureAddressOwner(userId, id);

  return prisma.$transaction(async (tx) => {
    if (data.isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.update({ where: { id }, data });
  });
}

export async function deleteAddress(userId: number, id: number) {
  await ensureAddressOwner(userId, id);
  await prisma.address.delete({ where: { id } });
  return { ok: true };
}

export async function setDefaultAddress(userId: number, id: number) {
  await ensureAddressOwner(userId, id);
  await clearDefaultAddress(userId);
  return prisma.address.update({ where: { id }, data: { isDefault: true } });
}

export async function changePassword(userId: number, input: unknown) {
  const data = passwordSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Khong tim thay tai khoan");

  const ok = await bcrypt.compare(data.currentPassword, user.password);
  if (!ok) throw new Error("Mat khau hien tai khong dung");

  const password = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password } });
  return { ok: true };
}

async function ensureAddressOwner(userId: number, id: number) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new Error("Khong tim thay dia chi");
}
