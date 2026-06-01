import { Badge } from "@/components/common/Badge";
import { formatCurrency } from "@/lib/utils";

export function ProductPrice({
  price,
  discountPrice,
  size = "md"
}: {
  price: string | number;
  discountPrice?: string | number | null;
  size?: "sm" | "md" | "lg";
}) {
  const hasDiscount = Boolean(discountPrice);
  const finalPrice = discountPrice || price;
  const discountPercent = hasDiscount
    ? Math.max(0, Math.round((1 - Number(discountPrice) / Number(price)) * 100))
    : 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={size === "lg" ? "text-3xl font-black text-primary-700" : size === "sm" ? "text-base font-black text-primary-700" : "text-xl font-black text-primary-700"}>
        {formatCurrency(finalPrice)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-slate-400 line-through">{formatCurrency(price)}</span>
          {discountPercent > 0 && <Badge variant="danger">-{discountPercent}%</Badge>}
        </>
      )}
    </div>
  );
}
