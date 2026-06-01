"use client";

import { AlertCircle, Bell, CheckCheck, Megaphone, PackageCheck, RefreshCw, ShoppingBag, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { API_URL, apiGet, apiPut } from "@/lib/api";
import { ApiResponse, Notification, NotificationType } from "@/types";

type Payload = {
  items: Notification[];
  unreadCount: number;
};

export function NotificationDrawer() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<ApiResponse<Payload>>("/notifications?limit=20", session.accessToken);
      setItems(res.data.items);
      setUnreadCount(res.data.unreadCount);
    } catch {
      setError("Không tải được danh sách thông báo.");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  function openDrawer() {
    setOpen(true);
    load();
  }

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!session?.accessToken) return;
    const source = new EventSource(`${API_URL}/notifications/stream?token=${encodeURIComponent(session.accessToken)}`);

    source.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse((event as MessageEvent).data) as Notification;
        setItems((current) => [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 20));
        setUnreadCount((count) => count + (notification.isRead ? 0 : 1));
        setError("");
      } catch {
        setError("Thông báo mới không đúng định dạng.");
      }
    });

    source.onerror = () => {
      if (open) setError("Kết nối thông báo realtime bị gián đoạn, danh sách bên dưới vẫn là dữ liệu gần nhất.");
    };

    return () => source.close();
  }, [session?.accessToken, open]);

  async function openNotification(notification: Notification) {
    if (!session?.accessToken) return;
    try {
      if (!notification.isRead) {
        await apiPut(`/notifications/${notification.id}/read`, {}, session.accessToken);
        setItems((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
        setUnreadCount((count) => Math.max(count - 1, 0));
      }

      // Ưu tiên url có sẵn trong metadata
      let url = notification.metadata?.url as string | undefined;

      // Fallback thông minh theo loại thông báo nếu không có url
      if (!url) {
        if (notification.type === "NEW_ORDER") {
          // Thông báo đơn hàng mới cho seller
          url = "/seller/orders";
        } else if (notification.type === "ORDER_UPDATE" && notification.metadata?.orderId) {
          // Thông báo cập nhật đơn hàng cho customer
          url = `/orders/${notification.metadata.orderId}`;
        }
      }

      if (url) {
        setOpen(false);
        router.push(url);
      }
    } catch {
      setError("Không cập nhật được trạng thái đã đọc.");
    }
  }

  async function markAll() {
    if (!session?.accessToken) return;
    try {
      await apiPut("/notifications/read-all", {}, session.accessToken);
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      setError("Không thể đánh dấu tất cả đã đọc.");
    }
  }

  if (!session) return null;

  return (
    <>
      <button className="relative rounded-md p-2 hover:bg-slate-100" onClick={openDrawer} title="Thông báo">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setOpen(false)} aria-label="Đóng thông báo" />
          <aside className="fixed inset-y-0 right-0 flex h-dvh w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-lift sm:w-[520px]">
            <div className="flex min-h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5">
              <div>
                <h2 className="text-lg font-black text-slate-950">Thông báo</h2>
                <p className="text-xs font-semibold text-slate-500">{unreadCount} chưa đọc</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-10 w-10 px-0" onClick={load} disabled={loading} title="Tải lại">
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="ghost" className="h-10 w-10 px-0" onClick={markAll} title="Đánh dấu tất cả đã đọc">
                  <CheckCheck className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="h-10 w-10 px-0" onClick={() => setOpen(false)} title="Đóng">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60">
              {error && (
                <div className="m-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {loading && <p className="p-6 text-sm text-slate-500">Đang tải thông báo...</p>}
              {!loading && items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className="flex w-full gap-3 border-b border-slate-100 bg-white px-5 py-4 text-left transition hover:bg-primary-50/50"
                >
                  <NotificationIcon type={item.type} isRead={item.isRead} />
                  <span className="min-w-0 flex-1">
                    <span className={item.isRead ? "block font-semibold text-slate-700" : "block font-semibold text-slate-950"}>
                      {item.title}
                    </span>
                    <span className="mt-1 block whitespace-normal break-words text-sm leading-6 text-slate-600">{item.message}</span>
                    <span className="mt-1 block text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
                  </span>
                </button>
              ))}
              {!loading && !items.length && <p className="p-6 text-sm text-slate-500">Chưa có thông báo.</p>}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function NotificationIcon({ type, isRead }: { type: NotificationType; isRead: boolean }) {
  const className = isRead ? "h-4 w-4 text-slate-400" : "h-4 w-4 text-primary-700";
  const wrapper = isRead ? "bg-slate-100" : "bg-primary-50";

  const Icon = {
    NEW_ORDER: ShoppingBag,
    ORDER_UPDATE: PackageCheck,
    PAYMENT_STATUS: PackageCheck,
    PROMOTION: Megaphone,
    SYSTEM_ALERT: AlertCircle
  }[type];

  return (
    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${wrapper}`}>
      <Icon className={className} />
    </span>
  );
}
