export type Role = "USER" | "SELLER" | "ADMIN";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUND_REQUESTED";
export type PaymentMethod = "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO";
export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type ProductApprovalStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
export type SubOrderStatus = "PROCESSING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUND_REQUESTED";
export type VoucherType = "PERCENT" | "FIXED" | "FREE_SHIP";
export type NotificationType = "ORDER_UPDATE" | "PAYMENT_STATUS" | "PROMOTION" | "SYSTEM_ALERT" | "NEW_ORDER";

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

export type SellerProfile = {
  id: number;
  userId: number;
  shopName: string;
  shopSlug: string;
  shopDescription?: string | null;
  shopLogo?: string | null;
  shopBanner?: string | null;
  businessPhone: string;
  businessEmail: string;
  pickupAddress: string;
  status: SellerStatus;
  rejectReason?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  _count?: { products: number };
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
  sold?: number;
  rating?: number;
  isFeatured: boolean;
  isActive: boolean;
  sellerId?: number | null;
  seller?: SellerProfile | null;
  approvalStatus: ProductApprovalStatus;
  rejectReason?: string | null;
  approvedAt?: string | null;
  approvedById?: number | null;
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
  orderId?: number;
  subOrderId?: number | null;
  productId: number;
  quantity: number;
  price: string | number;
  product: Product;
};

export type Voucher = {
  id: number;
  code: string;
  type: VoucherType;
  value: string | number;
  minOrderValue: string | number;
  maxDiscount?: string | number | null;
  sellerId: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
};

export type SubOrder = {
  id: number;
  orderId: number;
  sellerId?: number | null;
  subTotal: string | number;
  shippingFee: string | number;
  discountAmount: string | number;
  trackingNumber?: string | null;
  status: SubOrderStatus;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  seller?: SellerProfile | null;
  voucher?: Voucher | null;
  order?: Order;
  items: OrderItem[];
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
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  user?: User;
  items: OrderItem[];
  subOrders?: SubOrder[];
};

export type Review = {
  id: number;
  rating: number;
  comment?: string;
  images?: string[];
  isVerified?: boolean;
  createdAt: string;
  user?: Pick<User, "id" | "name">;
};

export type Address = {
  id: number;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  metadata?: { orderId?: number; subOrderId?: number; productId?: number; url?: string };
  createdAt: string;
};
