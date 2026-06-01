import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/common/Input";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function TableToolbar({
  title,
  description,
  search,
  searchPlaceholder = "Tìm kiếm...",
  onSearchChange,
  filters,
  actions,
  className
}: Props) {
  return (
    <div className={cn("mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {title && <h2 className="text-lg font-black text-slate-950">{title}</h2>}
          {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
        </div>
        {actions}
      </div>
      {(onSearchChange || filters) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,360px)_1fr] lg:items-center">
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={search || ""}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap gap-2 lg:justify-end">{filters}</div>}
        </div>
      )}
    </div>
  );
}
