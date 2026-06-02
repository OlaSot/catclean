"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  NotificationItem,
  NotificationMarkReadApiResponse,
  NotificationsApiResponse,
  NotificationsReadAllApiResponse,
} from "@/features/notifications/types/notifications-api.types";
import { useT } from "@/i18n/useT";

type NotificationBellProps = {
  userRole: string;
};

function formatTimeAgo(iso: string, t: (key: string) => string): string {
  const date = new Date(iso);
  const ms = date.getTime();
  if (Number.isNaN(ms)) return iso;
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("notifications.justNow");
  if (minutes < 60) return `${minutes}${t("notifications.minutesAgo")}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t("notifications.hoursAgo")}`;
  const days = Math.floor(hours / 24);
  return `${days}${t("notifications.daysAgo")}`;
}

function getOrderHref(role: string, orderId: string): string {
  const r = role.toLowerCase();
  if (r === "admin" || r === "operator") return `/app/admin/orders/${orderId}`;
  if (r === "client") return `/app/client/orders/${orderId}`;
  if (r === "cleaner") return `/app/cleaner/orders/${orderId}`;
  return `/app`;
}

export default function NotificationBell({ userRole }: NotificationBellProps) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });
      const json = (await response.json()) as NotificationsApiResponse;
      if (!response.ok || json.error) {
        setItems([]);
        setError(json.error ?? "Failed to load notifications");
        return;
      }
      setItems((json.data ?? []).slice(0, 10));
    } catch {
      setItems([]);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, pathname]);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      const json = (await response.json()) as NotificationMarkReadApiResponse;
      if (!response.ok || json.error) {
        // revert best-effort
        setItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
        );
      }
    } catch {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (item.orderId) {
      void markRead(item.id);
      router.push(getOrderHref(userRole, item.orderId));
      setOpen(false);
      return;
    }

    void markRead(item.id);
  };

  const handleReadAll = async () => {
    setMarkingAll(true);
    setError(null);
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        credentials: "include",
      });
      const json = (await response.json()) as NotificationsReadAllApiResponse;
      if (!response.ok || json.error) {
        setError(json.error ?? "Failed to mark all as read");
        return;
      }
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setError("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#5B8DB8]/40 hover:bg-[#EEF4FA] hover:text-[#34597E]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {t("notifications.title")}
              </p>
              <p className="text-xs text-slate-500">
                {unreadCount === 0
                  ? t("common.allCaughtUp")
                  : `${unreadCount} ${t("common.unread")}`}
              </p>
            </div>
            <button
              type="button"
              disabled={markingAll || unreadCount === 0}
              onClick={() => void handleReadAll()}
              className="rounded-full bg-[#34597E]/10 px-3 py-1.5 text-xs font-semibold text-[#34597E] transition hover:bg-[#34597E]/15 disabled:opacity-50"
            >
              {markingAll ? t("notifications.marking") : t("common.markAllAsRead")}
            </button>
          </div>

          {error ? (
            <div className="px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              {t("notifications.loading")}
            </div>
          ) : null}

          {!loading && items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              {t("common.noNotifications")}
            </div>
          ) : null}

          {!loading && items.length > 0 ? (
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full px-4 py-3 text-left transition hover:bg-[#F6F8FB]/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          {!item.isRead ? (
                            <span className="h-2 w-2 rounded-full bg-[#5B8DB8]" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-transparent" />
                          )}
                          <span className="truncate">{item.title}</span>
                        </p>
                        {item.message ? (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                            {item.message}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-400">
                          {formatTimeAgo(item.createdAt, t)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

