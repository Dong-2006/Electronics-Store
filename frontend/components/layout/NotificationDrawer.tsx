"use client";

import { Bell, CheckCheck, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { API_URL, apiGet, apiPut } from "@/lib/api";
import { ApiResponse, Notification } from "@/types";

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

  async function load() {
    if (!session?.accessToken) return;
    const res = await apiGet<ApiResponse<Payload>>("/notifications?limit=20", session.accessToken);
    setItems(res.data.items);
    setUnreadCount(res.data.unreadCount);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return;
    const source = new EventSource(`${API_URL}/notifications/stream?token=${encodeURIComponent(session.accessToken)}`);
    source.addEventListener("notification", (event) => {
      const notification = JSON.parse((event as MessageEvent).data) as Notification;
      setItems((current) => [notification, ...current].slice(0, 20));
      setUnreadCount((count) => count + 1);
    });
    return () => source.close();
  }, [session?.accessToken]);

  async function openNotification(notification: Notification) {
    if (!session?.accessToken) return;
    if (!notification.isRead) {
      await apiPut(`/notifications/${notification.id}/read`, {}, session.accessToken);
      setItems((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
      setUnreadCount((count) => Math.max(count - 1, 0));
    }
    const url = notification.metadata?.url || (notification.metadata?.orderId ? `/orders/${notification.metadata.orderId}` : "");
    if (url) {
      setOpen(false);
      router.push(url);
    }
  }

  async function markAll() {
    if (!session?.accessToken) return;
    await apiPut("/notifications/read-all", {}, session.accessToken);
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }

  if (!session) return null;

  return (
    <>
      <button className="relative rounded-md p-2 hover:bg-slate-100" onClick={() => setOpen(true)} title="Thong bao">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />}
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} aria-label="Dong thong bao" />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <div>
                <h2 className="font-bold">Thong bao</h2>
                <p className="text-xs text-slate-500">{unreadCount} chua doc</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-3" onClick={markAll}><CheckCheck className="h-4 w-4" /></Button>
                <Button variant="ghost" className="px-3" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="h-[calc(100%-4rem)] overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className="flex w-full gap-3 border-b px-4 py-3 text-left hover:bg-slate-50"
                >
                  <span className={`mt-1 h-2 w-2 rounded-full ${item.isRead ? "bg-slate-200" : "bg-primary-600"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.title}</span>
                    <span className="line-clamp-2 text-sm text-slate-600">{item.message}</span>
                    <span className="mt-1 block text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
                  </span>
                </button>
              ))}
              {!items.length && <p className="p-6 text-sm text-slate-500">Chua co thong bao.</p>}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
