import { MapPin, Phone, Star } from "lucide-react";
import { Address } from "@/types";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export function AddressCard({
  address,
  selected,
  onSelect,
  onDelete,
  onDefault
}: {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onDefault?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-soft",
        selected ? "border-primary-500 ring-4 ring-primary-100" : "border-slate-200"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-slate-950">{address.label}</p>
            {address.isDefault && <Badge variant="primary"><Star className="h-3 w-3" /> Mặc định</Badge>}
          </div>
          <p className="mt-2 font-semibold text-slate-800">{address.fullName}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Phone className="h-4 w-4" /> {address.phone}</p>
          <p className="mt-1 flex items-start gap-2 text-sm leading-6 text-slate-600">
            <MapPin className="mt-1 h-4 w-4 shrink-0" />
            {address.address}, {address.city}, {address.country}
          </p>
        </div>
        {onSelect && <Button variant={selected ? "primary" : "secondary"} onClick={onSelect}>{selected ? "Đang chọn" : "Chọn"}</Button>}
      </div>
      {(onDefault || onDelete) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {onDefault && !address.isDefault && <Button size="sm" variant="secondary" onClick={onDefault}>Đặt mặc định</Button>}
          {onDelete && <Button size="sm" variant="danger" onClick={onDelete}>Xóa</Button>}
        </div>
      )}
    </div>
  );
}
