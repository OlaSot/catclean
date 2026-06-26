"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import type { ClientOrder } from "@/entities/order/client-order.types";
import {
  fetchClientOrders,
  fetchNotifications,
  fetchPreferredCleaner,
} from "../api/client-portal-api";
import {
  computeDashboardStats,
  getLatestCompletedOrder,
  getNextUpcomingOrder,
  mapClientOrderToPortal,
} from "../lib/portal-order.mapper";
import { buildRepeatBookingHref } from "../lib/repeat-booking";
import { getGreetingName, getTimeGreeting } from "../lib/portal-utils";
import { PORTAL_SERVICES, PORTAL_SERVICE_BY_ID } from "../lib/service-catalog";
import {
  PORTAL_DESKTOP_GRID_CLASS,
  PORTAL_DESKTOP_MAIN_CLASS,
  PORTAL_DESKTOP_SIDEBAR_CLASS,
  PORTAL_GREETING_CLASS,
  PORTAL_MUTED_CLASS,
  PORTAL_SECTION_TITLE_CLASS,
} from "../lib/portal-styles";
import type { PortalNotification, PortalPreferredCleaner } from "../types/portal.types";
import { useClientPortal } from "../providers/ClientPortalProvider";
import NextCleaningHeroCard from "../components/NextCleaningHeroCard";
import PortalOrderCard from "../components/PortalOrderCard";
import ServiceBookingCard from "../components/ServiceBookingCard";
import SupportCard from "../components/SupportCard";
import DashboardSidebarWidgets from "../components/DashboardSidebarWidgets";
import PortalEmptyState from "../components/PortalEmptyState";
import PortalPrimaryButton from "../components/PortalPrimaryButton";

function mapNotification(item: {
  id: string;
  type: string;
  title: string;
  message: string | null;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}): PortalNotification {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message ?? "",
    orderId: item.orderId ?? undefined,
    isRead: item.isRead,
    createdAt: item.createdAt,
  };
}

export default function ClientDashboardView() {
  const { profile, unreadCount } = useClientPortal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [preferredCleaner, setPreferredCleaner] = useState<PortalPreferredCleaner | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [ordersData, notificationsData, cleanerData] = await Promise.all([
          fetchClientOrders(),
          fetchNotifications(),
          fetchPreferredCleaner(),
        ]);

        if (cancelled) return;

        setOrders(ordersData);
        setNotifications(notificationsData.slice(0, 3).map(mapNotification));
        setPreferredCleaner(cleanerData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const portalOrders = useMemo(() => orders.map(mapClientOrderToPortal), [orders]);
  const nextRaw = useMemo(() => getNextUpcomingOrder(orders), [orders]);
  const nextOrder = useMemo(
    () => (nextRaw ? mapClientOrderToPortal(nextRaw) : null),
    [nextRaw],
  );
  const recentOrders = portalOrders.slice(0, 5);
  const stats = useMemo(() => computeDashboardStats(orders), [orders]);
  const latestCompleted = useMemo(() => getLatestCompletedOrder(orders), [orders]);
  const bookAgainHref = latestCompleted
    ? buildRepeatBookingHref(mapClientOrderToPortal(latestCompleted))
    : null;

  const greetingName = profile ? getGreetingName(profile.fullName) : "there";

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">Loading your dashboard…</div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className={PORTAL_DESKTOP_GRID_CLASS}>
      <div className={PORTAL_DESKTOP_MAIN_CLASS}>
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={PORTAL_MUTED_CLASS}>
              {getTimeGreeting()}, {greetingName} 👋
            </p>
            <h1 className={`${PORTAL_GREETING_CLASS} mt-1`}>
              Your home, cared for
            </h1>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/app/client/notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-[#34597E] shadow-sm transition hover:border-[#C5D9EB] hover:bg-[#f9fcff]"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden />
              {unreadCount > 0 ? (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#34597E]" />
              ) : null}
            </Link>
            <Link
              href="/app/client/profile"
              className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white py-2 pl-2 pr-4 shadow-sm transition hover:border-[#C5D9EB]"
            >
              <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-[#EEF4FA]">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#34597E]">
                    {profile?.firstName?.[0] ?? "?"}
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {profile?.firstName ?? "Profile"}
              </span>
            </Link>
          </div>
        </header>

        <section aria-labelledby="next-cleaning-heading">
          <p
            id="next-cleaning-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 lg:sr-only"
          >
            Your next cleaning
          </p>
          {nextOrder ? (
            <NextCleaningHeroCard
              order={nextOrder}
              imageUrl={PORTAL_SERVICE_BY_ID[nextOrder.serviceId].imageUrl}
            />
          ) : (
            <PortalEmptyState
              title="You don't have any upcoming cleanings."
              description="Book your next visit and we'll take care of the rest."
              action={
                <PortalPrimaryButton href="/booking">
                  Book Cleaning
                </PortalPrimaryButton>
              }
            />
          )}
        </section>

        <section aria-labelledby="book-today-heading">
          <h2 id="book-today-heading" className={PORTAL_SECTION_TITLE_CLASS}>
            What would you like to book today?
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {PORTAL_SERVICES.map((service) => (
              <ServiceBookingCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        <section aria-labelledby="recent-orders-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="recent-orders-heading" className={PORTAL_SECTION_TITLE_CLASS}>
              Recent Orders
            </h2>
            <Link
              href="/app/client/orders"
              className="text-sm font-semibold text-[#34597E] hover:underline"
            >
              See all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <PortalEmptyState
              title="No orders yet"
              description="Your booking history will appear here after your first visit."
              action={
                <PortalPrimaryButton href="/booking">
                  Book Cleaning
                </PortalPrimaryButton>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {recentOrders.map((order) => (
                <PortalOrderCard key={order.id} order={order} variant="compact" showRepeatBooking />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="support-heading" className="lg:hidden">
          <h2 id="support-heading" className="sr-only">
            Support
          </h2>
          <SupportCard />
        </section>
      </div>

      <aside className={PORTAL_DESKTOP_SIDEBAR_CLASS}>
        <DashboardSidebarWidgets
          nextOrder={nextOrder}
          notifications={notifications}
          preferredCleaner={preferredCleaner}
          stats={stats}
          bookAgainHref={bookAgainHref}
        />
      </aside>
    </div>
  );
}
