import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma/client";

export const registerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu")
});

function signToken(user: { id: number; email: string; role: "USER" | "ADMIN" }) {
  return jwt.sign(user, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
}

export async function register(input: unknown) {
  const data = registerSchema.parse(input);
  const existed = await prisma.user.findUnique({ where: { email: data.email } });
  if (existed) throw new Error("Email đã được sử dụng");

  const password = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password,
      phone: data.phone,
      cart: { create: {} }
    },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }
  });

  return { user, token: signToken({ id: user.id, email: user.email, role: user.role }) };
}

export async function login(input: unknown) {
  const data = loginSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("Email hoặc mật khẩu không đúng");
  if (!user.isActive) throw new Error("Tài khoản đã bị khóa");

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new Error("Email hoặc mật khẩu không đúng");

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive
    },
    token: signToken({ id: user.id, email: user.email, role: user.role })
  };
}

export async function getMe(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }
  });
}
