import Image from "next/image";
import { Button } from "@/components/common/Button";
import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function CartItemRow({
  item,
  onUpdate,
  onRemove
}: {
  item: CartItem;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}) {
  const price = Number(item.product.discountPrice || item.product.price);

  return (
    <div className="grid gap-4 rounded-md border bg-white p-4 md:grid-cols-[96px_1fr_180px_120px] md:items-center">
      <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
      </div>
      <div>
        <h3 className="font-semibold">{item.product.name}</h3>
        <p className="text-sm text-slate-500">{formatCurrency(price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => onUpdate(Math.max(1, item.quantity - 1))}>-</Button>
        <span className="w-10 text-center">{item.quantity}</span>
        <Button variant="secondary" onClick={() => onUpdate(item.quantity + 1)}>+</Button>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary-700">{formatCurrency(price * item.quantity)}</p>
        <Button variant="ghost" onClick={onRemove}>Xóa</Button>
      </div>
    </div>
  );
}
