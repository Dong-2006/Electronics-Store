import Image from "next/image";
import { Modal } from "@/components/common/Modal";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";

type Props = {
  product: Product | null;
  onClose: () => void;
};

export function ProductDetailModal({ product, onClose }: Props) {
  if (!product) return null;

  return (
    <Modal open={!!product} onClose={onClose} title="Chi tiết sản phẩm">
      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200">
            <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1">{product.category?.name}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1">{product.brand?.name}</span>
              <StatusBadge status={product.approvalStatus} />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(product.discountPrice || product.price)}
            </p>
            {product.discountPrice && (
              <p className="text-sm text-slate-400 line-through">{formatCurrency(product.price)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Shop / Người bán</p>
              <p className="font-medium text-slate-900">{product.seller?.shopName || "Admin (Nền tảng)"}</p>
            </div>
            <div>
              <p className="text-slate-500">Tồn kho</p>
              <p className="font-medium text-slate-900">{product.stock} sản phẩm</p>
            </div>
            <div>
              <p className="text-slate-500">Bảo hành</p>
              <p className="font-medium text-slate-900">{product.warrantyMonths} tháng</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-semibold text-slate-900">Mô tả:</p>
            <p className="whitespace-pre-wrap text-xs leading-5 text-slate-600">{product.description}</p>
          </div>

          {product.specifications && product.specifications.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Thông số kỹ thuật:</p>
              <div className="grid gap-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                    <span className="text-slate-500">{spec.key}</span>
                    <span className="text-right font-medium text-slate-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.rejectReason && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-100">
              <p className="font-semibold mb-1">Lý do từ chối:</p>
              <p className="text-xs">{product.rejectReason}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
