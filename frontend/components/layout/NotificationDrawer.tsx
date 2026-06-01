"use client";

import { AlertCircle, Bell, CheckCheck, Inbox, Megaphone, PackageCheck, RefreshCw, ShoppingBag, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, apiGet, apiPut } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ApiResponse, Notification, NotificationType } from "@/types";

type Payload = {
  items: Notification[];
  unreadCount: number;
};

type Props = {
  light?: boolean;
};

function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function NotificationDrawer({ light = false }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFreshNotification, setHasFreshNotification] = useState(false);
  const freshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        setHasFreshNotification(true);
        if (freshTimer.current) clearTimeout(freshTimer.current);
        freshTimer.current = setTimeout(() => setHasFreshNotification(false), 900);
      } catch {
        setError("Thông báo mới không đúng định dạng.");
      }
    });

    source.onerror = () => {
      if (open) setError("Kết nối thông báo realtime bị gián đoạn, danh sách bên dưới vẫn là dữ liệu gần nhất.");
    };

    return () => source.close();
  }, [session?.accessToken, open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    return () => {
      if (freshTimer.current) clearTimeout(freshTimer.current);
    };
  }, []);

  async function openNotification(notification: Notification) {
    if (!session?.accessToken) return;
    try {
      if (!notification.isRead) {
        await apiPut(`/notifications/${notification.id}/read`, {}, session.accessToken);
        setItems((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
        setUnreadCount((count) => Math.max(count - 1, 0));
      }

      let url = notification.metadata?.url as string | undefined;

      if (!url) {
        if (notification.type === "NEW_ORDER") {
          url = "/seller/orders";
        } else if (notification.type === "ORDER_UPDATE" && notification.metadata?.orderId) {
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
      <button
        className={cn(
          "group relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2",
          light
            ? "border-white/10 bg-white/10 text-slate-100 backdrop-blur-md hover:bg-white/20 hover:text-white focus:ring-offset-slate-950"
            : "border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:border-sky-100 hover:bg-sky-100 hover:text-blue-600 focus:ring-offset-white",
          open && (light ? "bg-white/20 text-white" : "border-sky-200 bg-sky-100 text-blue-700"),
          hasFreshNotification && "scale-105"
        )}
        onClick={openDrawer}
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", hasFreshNotification && "animate-pulse")} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white animate-pulse">
            {formatUnreadCount(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-label="Đóng thông báo" />
          <aside className="fixed inset-y-3 right-3 flex h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[420px] animate-slide-up flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:inset-y-4 sm:right-4 sm:h-[calc(100dvh-2rem)]">
            <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-slate-950">Notifications</h2>
                    <p className="text-xs font-semibold text-slate-500">{unreadCount} chưa đọc</p>
                  </div>
                </div>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                  onClick={() => setOpen(false)}
                  title="Đóng"
                  aria-label="Đóng thông báo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-sky-100 hover:bg-sky-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={load}
                  disabled={loading}
                  title="Tải lại"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </button>
                <button
                  className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={markAll}
                  disabled={unreadCount === 0}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 p-3">
              {error && (
                <div className="mb-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {loading && (
                <div className="space-y-2">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="skeleton-shimmer h-3 w-2/3 rounded-full" />
                      <div className="skeleton-shimmer mt-3 h-3 w-full rounded-full" />
                      <div className="skeleton-shimmer mt-2 h-3 w-1/3 rounded-full" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className={cn(
                    "group mb-2 flex w-full gap-3 rounded-xl border p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-sky-400/50",
                    item.isRead
                      ? "border-slate-100 bg-white hover:bg-slate-50"
                      : "border-blue-100 bg-blue-50 hover:border-blue-200 hover:bg-blue-50/80"
                  )}
                >
                  <NotificationIcon type={item.type} isRead={item.isRead} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className={cn("block text-sm font-black", item.isRead ? "text-slate-700" : "text-slate-950")}>
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500 ring-2 ring-white" aria-label="Chưa đọc" />
                      )}
                    </span>
                    <span className="mt-1 block whitespace-normal break-words text-sm leading-6 text-slate-600">{item.message}</span>
                    <span className="mt-2 block text-xs font-semibold text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
                  </span>
                </button>
              ))}

              {!loading && !items.length && (
                <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
                  <div>
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Inbox className="h-7 w-7" />
                    </span>
                    <h3 className="mt-4 text-base font-black text-slate-950">No notifications yet</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">You&apos;re all caught up.</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function NotificationIcon({ type, isRead }: { type: NotificationType; isRead: boolean }) {
  const className = isRead ? "h-4 w-4 text-slate-400" : "h-4 w-4 text-blue-700";
  const wrapper = isRead ? "bg-slate-100" : "bg-white text-blue-700 ring-1 ring-blue-100";

  const Icon = {
    NEW_ORDER: ShoppingBag,
    ORDER_UPDATE: PackageCheck,
    PAYMENT_STATUS: PackageCheck,
    PROMOTION: Megaphone,
    SYSTEM_ALERT: AlertCircle
  }[type];

  return (
    <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105", wrapper)}>
      <Icon className={className} />
    </span>
  );
}
