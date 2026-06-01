import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating = 0,
  count,
  className
}: {
  rating?: number;
  count?: number | string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1 text-sm font-semibold text-amber-600", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
      <span className="ml-1 text-slate-700">{Number(rating || 0).toFixed(1)}</span>
      {count !== undefined && <span className="text-slate-400">({count})</span>}
    </div>
  );
}
