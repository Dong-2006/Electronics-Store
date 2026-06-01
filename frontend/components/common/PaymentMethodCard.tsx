import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { PaymentMethod } from "@/types";
import { RadioCard } from "./RadioCard";

const methods: Record<PaymentMethod, { title: string; description: string; icon: JSX.Element }> = {
  COD: {
    title: "Thanh toán khi nhận hàng",
    description: "Thanh toán trực tiếp sau khi kiểm tra hàng.",
    icon: <Banknote className="h-5 w-5" />
  },
  BANK_TRANSFER: {
    title: "Chuyển khoản ngân hàng",
    description: "Thông tin chuyển khoản sẽ được xác nhận sau đặt hàng.",
    icon: <CreditCard className="h-5 w-5" />
  },
  VNPAY: {
    title: "VNPAY",
    description: "Cổng thanh toán VNPAY. Hiện tại backend chưa có callback thật.",
    icon: <CreditCard className="h-5 w-5" />
  },
  MOMO: {
    title: "MoMo",
    description: "Ví MoMo. Hiện tại backend chưa có callback thật.",
    icon: <Smartphone className="h-5 w-5" />
  }
};

export function PaymentMethodCard({
  method,
  selected,
  onSelect
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  const item = methods[method];
  return (
    <RadioCard
      checked={selected}
      onClick={onSelect}
      title={item.title}
      description={item.description}
      icon={item.icon}
      name="paymentMethod"
    />
  );
}
