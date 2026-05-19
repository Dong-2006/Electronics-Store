import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { getProductImage } from "@/lib/product-images";
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
    <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[96px_1fr_170px_130px] md:items-center">
      <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
        <Image src={getProductImage(item.product)} alt={item.product.name} fill className="object-contain p-2" />
      </div>
      <div>
        <h3 className="font-bold text-slate-950">{item.product.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{formatCurrency(price)}</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">Còn {item.product.stock} sản phẩm</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" className="h-9 w-9 px-0" onClick={() => onUpdate(Math.max(1, item.quantity - 1))}><Minus className="h-4 w-4" /></Button>
        <span className="grid h-9 w-12 place-items-center rounded-md border border-slate-200 bg-slate-50 text-sm font-bold">{item.quantity}</span>
        <Button variant="secondary" className="h-9 w-9 px-0" onClick={() => onUpdate(item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="text-left md:text-right">
        <p className="font-black text-primary-700">{formatCurrency(price * item.quantity)}</p>
        <Button variant="ghost" className="mt-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onRemove}>
          <Trash2 className="h-4 w-4" /> Xóa
        </Button>
      </div>
    </div>
  );
}
