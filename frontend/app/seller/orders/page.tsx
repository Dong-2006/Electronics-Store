"use client";

import {
  AlertTriangle, CheckCircle2, ChevronRight, Clock,
  Filter, Package, Phone, RefreshCw, Truck, User, XCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { TableSkeleton } from "@/components/common/Skeleton";
import { Textarea } from "@/components/common/Textarea";
import { useToast } from "@/components/common/Toast";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, SubOrder, SubOrderStatus } from "@/types";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<SubOrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  PROCESSING:       { label: "Chờ xử lý",    color: "text-amber-700 bg-amber-50 border-amber-200",   icon: Clock },
  CONFIRMED:        { label: "Đã xác nhận",   color: "text-blue-700 bg-blue-50 border-blue-200",     icon: CheckCircle2 },
  SHIPPED:          { label: "Đang giao",     color: "text-violet-700 bg-violet-50 border-violet-200", icon: Truck },
  DELIVERED:        { label: "Đã giao",       color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: Package },
  CANCELLED:        { label: "Đã hủy",        color: "text-red-700 bg-red-50 border-red-200",         icon: XCircle },
  REFUND_REQUESTED: { label: "Hoàn tiền",     color: "text-orange-700 bg-orange-50 border-orange-200", icon: AlertTriangle },
};

/**
 * Chỉ trả về các trạng thái hợp lệ có thể chuyển sang từ trạng thái hiện tại.
 * Logic này mirror đúng với backend: chỉ tiến về phía trước + cho phép hủy.
 */
function getNextStatuses(current: SubOrderStatus): SubOrderStatus[] {
  switch (current) {
    case "PROCESSING": return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":  return ["SHIPPED",   "CANCELLED"];
    case "SHIPPED":    return ["DELIVERED", "CANCELLED"];
    default:           return []; // DELIVERED, CANCELLED, REFUND_REQUESTED → không thể thay đổi
  }
}

const ACTION_CONFIG: Partial<Record<SubOrderStatus, { label: string; variant: "primary" | "danger"; icon: React.ElementType }>> = {
  CONFIRMED:  { label: "Xác nhận đơn",   variant: "primary", icon: CheckCircle2 },
  SHIPPED:    { label: "Đã giao vận",    variant: "primary", icon: Truck },
  DELIVERED:  { label: "Hoàn thành",     variant: "primary", icon: Package },
  CANCELLED:  { label: "Hủy đơn",        variant: "danger",  icon: XCircle },
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "",            label: "Tất cả" },
  { value: "PROCESSING",  label: "Chờ xử lý" },
  { value: "CONFIRMED",   label: "Đã xác nhận" },
  { value: "SHIPPED",     label: "Đang giao" },
  { value: "DELIVERED",   label: "Đã giao" },
  { value: "CANCELLED",   label: "Đã hủy" },
];

// ─── Sub-order card ───────────────────────────────────────────────────────────
function OrderCard({
  order,
  onAction,
}: {
  order: SubOrder;
  onAction: (order: SubOrder, nextStatus: SubOrderStatus) => void;
}) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PROCESSING;
  const Icon = cfg.icon;
  const nextStatuses = getNextStatuses(order.status);
  const total = Number(order.subTotal) + Number(order.shippingFee) - Number(order.discountAmount);
  const isTerminal = nextStatuses.length === 0;

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-card transition-shadow hover:shadow-lift ${isTerminal ? "opacity-80" : ""}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 bg-slate-50/60 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm">
            <Icon className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Sub-order #{order.id}</p>
            <p className="text-xs text-slate-400">Đơn gốc #{order.orderId}</p>
          </div>
        </div>
        <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <div className="p-5">
        {/* Customer + total */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            {order.order?.fullName && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold">{order.order.fullName}</span>
              </div>
            )}
            {order.order?.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{order.order.phone}</span>
              </div>
            )}
            {order.order?.address && (
              <p className="max-w-xs text-xs leading-5 text-slate-400">{order.order.address}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Tổng tiền</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(total)}</p>
            {Number(order.discountAmount) > 0 && (
              <p className="text-xs text-emerald-600">- {formatCurrency(order.discountAmount)} voucher</p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="mt-4 space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className="truncate text-sm font-medium text-slate-700">{item.product.name}</span>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-slate-400">×{item.quantity}</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(Number(item.price) * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tracking number (nếu đã ship) */}
        {order.trackingNumber && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2.5">
            <Truck className="h-4 w-4 shrink-0 text-violet-500" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-500">Mã vận đơn</p>
              <p className="font-bold text-violet-900">{order.trackingNumber}</p>
            </div>
          </div>
        )}

        {/* Cancel reason */}
        {order.cancelReason && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">Lý do hủy</p>
              <p className="text-sm text-red-800">{order.cancelReason}</p>
            </div>
          </div>
        )}

        {/* Ngày tạo */}
        <p className="mt-3 text-[11px] text-slate-400">
          {new Date(order.createdAt).toLocaleString("vi-VN")}
        </p>

        {/* Action buttons — chỉ hiển thị bước tiếp theo hợp lệ */}
        {nextStatuses.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <p className="mr-auto text-xs font-semibold text-slate-400">Cập nhật trạng thái:</p>
            {nextStatuses.map((next) => {
              const action = ACTION_CONFIG[next];
              if (!action) return null;
              const ActionIcon = action.icon;
              return (
                <button
                  key={next}
                  onClick={() => onAction(order, next)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                    action.variant === "danger"
                      ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-sm"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-blue-400"
                  }`}
                >
                  <ActionIcon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {isTerminal && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Đơn hàng đã kết thúc — không thể thay đổi trạng thái
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SellerOrdersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<SubOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<{ order: SubOrder; status: SubOrderStatus } | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await apiGet<ApiResponse<SubOrder[]>>("/seller/orders", session.accessToken);
      setOrders(res.data);
    } catch (error) {
      toast({ title: "Không tải được đơn hàng shop", description: getErrorMessage(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.accessToken]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => !statusFilter || order.status === statusFilter),
    [orders, statusFilter]
  );

  // Đếm từng loại trạng thái cho badge trên filter tab
  const countByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => { map[o.status] = (map[o.status] ?? 0) + 1; });
    return map;
  }, [orders]);

  function openAction(order: SubOrder, nextStatus: SubOrderStatus) {
    setEditing({ order, status: nextStatus });
    setTrackingNumber("");
    setCancelReason("");
  }

  async function confirmUpdate(event: FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !editing) return;
    setSubmitting(true);
    try {
      await apiPut(
        `/seller/orders/${editing.order.id}/status`,
        { status: editing.status, trackingNumber, cancelReason },
        session.accessToken
      );
      toast({ title: "Đã cập nhật đơn hàng", variant: "success" });
      setEditing(null);
      await load();
    } catch (error) {
      toast({ title: "Không thể cập nhật đơn hàng", description: getErrorMessage(error), variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const editingCfg = editing ? STATUS_CONFIG[editing.status] : null;
  const actionCfg = editing ? ACTION_CONFIG[editing.status] : null;

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="muted-label text-blue-600">Seller</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Quản lý đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Xử lý và theo dõi tiến trình giao hàng cho từng đơn.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        {FILTER_TABS.map((tab) => {
          const count = tab.value ? (countByStatus[tab.value] ?? 0) : orders.length;
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : filteredOrders.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onAction={openAction} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-slate-300" />
          <p className="font-bold text-slate-600">Không có đơn hàng nào</p>
          <p className="mt-1 text-sm text-slate-400">
            {statusFilter ? `Không có đơn hàng với trạng thái "${STATUS_CONFIG[statusFilter as SubOrderStatus]?.label ?? statusFilter}"` : "Chưa có đơn hàng nào trong shop."}
          </p>
        </div>
      )}

      {/* Confirm modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Xác nhận: ${actionCfg?.label ?? "Cập nhật"}`}
        description={
          editing
            ? `Sub-order #${editing.order.id} sẽ chuyển sang trạng thái "${editingCfg?.label ?? editing.status}"`
            : ""
        }
      >
        <form onSubmit={confirmUpdate} className="space-y-4">
          {/* Thông tin cần nhập thêm tùy theo trạng thái */}
          {editing?.status === "SHIPPED" && (
            <FormField label="Mã vận đơn" helper="Bắt buộc khi chuyển sang trạng thái Đang giao.">
              <Input
                required
                placeholder="VD: VN123456789"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </FormField>
          )}

          {editing?.status === "CANCELLED" && (
            <FormField label="Lý do hủy" helper="Khách hàng sẽ nhận được thông báo kèm lý do này.">
              <Textarea
                required
                placeholder="Ví dụ: Hết hàng, không thể giao đến khu vực này..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </FormField>
          )}

          {editing?.status !== "SHIPPED" && editing?.status !== "CANCELLED" && (
            <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${editingCfg?.color ?? ""}`}>
              {editingCfg && <editingCfg.icon className="mt-0.5 h-4 w-4 shrink-0" />}
              <p className="text-sm font-medium">
                Xác nhận chuyển đơn hàng sang trạng thái <strong>{editingCfg?.label}</strong>?
                Hành động này không thể hoàn tác.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              loadingText="Đang cập nhật..."
              className={editing?.status === "CANCELLED" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {actionCfg?.label ?? "Xác nhận"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
