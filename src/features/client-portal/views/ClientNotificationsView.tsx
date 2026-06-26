"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/client-portal-api";
import type { PortalNotification } from "../types/portal.types";
import { formatNotificationDate } from "../lib/portal-utils";
import { useClientPortal } from "../providers/ClientPortalProvider";
import {
  PORTAL_CARD_CLASS,
  PORTAL_GREETING_CLASS,
  PORTAL_MUTED_CLASS,
} from "../lib/portal-styles";
import PortalEmptyState from "../components/PortalEmptyState";
import PortalPrimaryButton from "../components/PortalPrimaryButton";

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  cleaner_assigned: UserCheck,
  reminder: Bell,
  cleaning_completed: CheckCircle2,
  payment_received: CreditCard,
};

function NotificationCard({
  notification,
  onRead,
}: {
  notification: PortalNotification;
  onRead: (id: string) => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;

  const inner = (
    <article
      className={`${PORTAL_CARD_CLASS} relative overflow-hidden p-5 transition ${
        notification.isRead ? "opacity-80" : "ring-2 ring-[#34597E]/15"
      }`}
      onClick={() => {
        if (!notification.isRead) onRead(notification.id);
      }}
    >
      {!notification.isRead ? (
        <span className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-[#34597E]" />
      ) : null}
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#34597E] ring-1 ring-[#C5D9EB]">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pr-4">
          <p className="font-semibold text-slate-800">{notification.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {formatNotificationDate(notification.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );

  if (notification.orderId) {
    return (
      <Link href={`/app/client/orders/${notification.orderId}`} className="block">
        {inner}
      </Link>
    );
  }

  return inner;
}

export default function ClientNotificationsView() {
  const { refreshUnreadCount } = useClientPortal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications();
      setNotifications(
        data.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          message: item.message ?? "",
          createdAt: item.createdAt,
          isRead: item.isRead,
          orderId: item.orderId ?? undefined,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await markNotificationRead(id);
      await refreshUnreadCount();
    } catch {
      await load();
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await refreshUnreadCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading notifications…</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={PORTAL_GREETING_CLASS}>Notifications</h1>
          <p className={`${PORTAL_MUTED_CLASS} mt-1`}>
            {unreadCount > 0
              ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            disabled={markingAll}
            onClick={() => void handleMarkAllRead()}
            className="rounded-full bg-[#EEF4FA] px-4 py-2 text-sm font-semibold text-[#34597E] transition hover:bg-[#dce9f5] disabled:opacity-60"
          >
            {markingAll ? "Marking…" : "Mark all read"}
          </button>
        ) : null}
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <PortalEmptyState
          title="No notifications"
          description="Updates about your bookings and cleanings will appear here."
          action={
            <PortalPrimaryButton href="/booking">Book Cleaning</PortalPrimaryButton>
          }
        />
      ) : (
        <div className="relative space-y-4 pl-4 before:absolute before:bottom-2 before:left-[1.375rem] before:top-2 before:w-px before:bg-slate-200">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
