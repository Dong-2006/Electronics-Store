export type Role = "USER" | "ADMIN";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "COD" | "BANK_TRANSFER";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
};

export type Brand = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
};

export type Specification = {
  id?: number;
  key: string;
  value: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  discountPrice?: string | number | null;
  stock: number;
  image: string;
  images?: string[];
  categoryId: number;
  brandId: number;
  warrantyMonths: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  category?: Category;
  brand?: Brand;
  specifications?: Specification[];
  reviews?: Review[];
};

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
};

export type Cart = {
  id: number;
  userId: number;
  items: CartItem[];
};

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: string | number;
  product: Product;
};

export type Order = {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  note?: string;
  totalAmount: string | number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: "UNPAID" | "PAID";
  createdAt: string;
  user?: User;
  items: OrderItem[];
};

export type Review = {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: Pick<User, "id" | "name">;
};
