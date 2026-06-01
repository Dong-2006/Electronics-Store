import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    PROCESSING: "Đang xử lý",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    SHIPPED: "Đã gửi hàng",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
    REFUND_REQUESTED: "Yêu cầu hoàn tiền",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    DRAFT: "Bản nháp",
    SUSPENDED: "Tạm khóa",
    COD: "Thanh toán khi nhận hàng",
    BANK_TRANSFER: "Chuyển khoản",
    VNPAY: "VNPAY",
    MOMO: "MoMo",
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán lỗi",
    REFUNDED: "Đã hoàn tiền",
    ACTIVE: "Đang bật",
    INACTIVE: "Đã tắt"
  };
  return labels[status] || status;
}
