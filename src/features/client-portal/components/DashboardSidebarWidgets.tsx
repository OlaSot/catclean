import Image from "next/image";
import Link from "next/link";
import { Bell, Calendar, Star } from "lucide-react";
import type {
  PortalDashboardStats,
  PortalNotification,
  PortalOrder,
  PortalPreferredCleaner,
} from "../types/portal.types";
import { formatShortDate } from "../lib/portal-utils";
import { PORTAL_CARD_CLASS } from "../lib/portal-styles";
import SupportCard from "./SupportCard";

type DashboardSidebarWidgetsProps = {
  nextOrder: PortalOrder | null;
  notifications: PortalNotification[];
  preferredCleaner: PortalPreferredCleaner | null;
  stats: PortalDashboardStats;
  bookAgainHref: string | null;
};

export default function DashboardSidebarWidgets({
  nextOrder,
  notifications,
  preferredCleaner,
  stats,
  bookAgainHref,
}: DashboardSidebarWidgetsProps) {
  return (
    <>
      {bookAgainHref ? (
        <section aria-labelledby="book-again-widget">
          <h2
            id="book-again-widget"
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Quick action
          </h2>
          <div className={`${PORTAL_CARD_CLASS} p-5`}>
            <p className="text-sm font-semibold text-slate-800">Book again</p>
            <p className="mt-1 text-sm text-slate-500">
              Repeat your last service with saved preferences.
            </p>
            <Link
              href={bookAgainHref}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#34597E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4d6f]"
            >
              Book Again
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="stats-widget">
        <h2
          id="stats-widget"
          className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Your stats
        </h2>
        <div className={`${PORTAL_CARD_CLASS} grid grid-cols-2 gap-px overflow-hidden bg-slate-100`}>
          <StatCell label="Completed" value={String(stats.completedCleanings)} />
          <StatCell label="Upcoming" value={String(stats.upcomingBookings)} />
          <StatCell
            label="Last booking"
            value={stats.lastBookingDate ? formatShortDate(stats.lastBookingDate) : "—"}
          />
          <StatCell label="Favorite service" value={stats.favoriteService ?? "—"} />
          {stats.averageRating !== null ? (
            <div className="col-span-2 bg-white p-4">
              <p className="text-xs text-slate-500">Average rating</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">
                {stats.averageRating.toFixed(1)} ★
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {preferredCleaner ? (
        <section aria-labelledby="preferred-cleaner-widget">
          <h2
            id="preferred-cleaner-widget"
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Preferred cleaner
          </h2>
          <div className={`${PORTAL_CARD_CLASS} overflow-hidden`}>
            <div className="flex items-center gap-4 p-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#EEF4FA] ring-2 ring-white shadow-sm">
                {preferredCleaner.avatarUrl ? (
                  <Image
                    src={preferredCleaner.avatarUrl}
                    alt={preferredCleaner.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#34597E]">
                    {preferredCleaner.name[0]}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{preferredCleaner.name}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
                  {preferredCleaner.averageRating !== null ? (
                    <>
                      <Star
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                      {preferredCleaner.averageRating.toFixed(1)} ·{" "}
                    </>
                  ) : null}
                  {preferredCleaner.completedOrders} visits
                </p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-4">
              <Link
                href="/booking?service=home_reset"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#34597E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d4d6f]"
              >
                Book again
              </Link>
              <Link
                href="/app/client/preferred-cleaner"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200/80 px-4 py-2.5 text-sm font-semibold text-[#34597E] transition hover:bg-[#f9fcff]"
              >
                View
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {nextOrder ? (
        <section aria-labelledby="upcoming-widget">
          <h2
            id="upcoming-widget"
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Upcoming
          </h2>
          <div className={`${PORTAL_CARD_CLASS} p-5`}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#34597E]">
                <Calendar className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{nextOrder.serviceName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {nextOrder.dayLabel} · {nextOrder.timeRange}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {nextOrder.scheduledDate}
                </p>
              </div>
            </div>
            <Link
              href={`/app/client/orders/${nextOrder.id}`}
              className="mt-4 inline-flex text-sm font-semibold text-[#34597E] hover:underline"
            >
              View order details →
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="notifications-widget">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2
            id="notifications-widget"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Notifications
          </h2>
          <Link
            href="/app/client/notifications"
            className="text-xs font-semibold text-[#34597E] hover:underline"
          >
            See all
          </Link>
        </div>
        <div className={`${PORTAL_CARD_CLASS} divide-y divide-slate-100`}>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                href={
                  notification.orderId
                    ? `/app/client/orders/${notification.orderId}`
                    : "/app/client/notifications"
                }
                className="flex gap-3 p-4 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#34597E]">
                  <Bell className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-slate-400">
                    {formatShortDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead ? (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#34597E]" />
                ) : null}
              </Link>
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="support-widget">
        <h2 id="support-widget" className="sr-only">
          Support
        </h2>
        <SupportCard compact />
      </section>
    </>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
