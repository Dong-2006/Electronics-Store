import { TicketPercent } from "lucide-react";
import { Input } from "./Input";

export function VoucherInput({
  value,
  onChange,
  placeholder,
  helper
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div>
      <div className="relative">
        <TicketPercent className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input value={value} onChange={(event) => onChange(event.target.value.toUpperCase())} placeholder={placeholder || "Nhập mã voucher"} className="pl-9 uppercase" />
      </div>
      {helper && <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>}
    </div>
  );
}
