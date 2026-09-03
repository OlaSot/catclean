"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, CalendarPlus, MapPin, Repeat2 } from "lucide-react";
import type { ClientOrder } from "@/entities/order/client-order.types";
import { fetchClientOrders } from "../api/client-portal-api";
import { getNextUpcomingOrder, mapClientOrderToPortal } from "../lib/portal-order.mapper";
import { buildRepeatBookingHref } from "../lib/repeat-booking";
import { formatPortalMoney, getGreetingName, getTimeGreeting } from "../lib/portal-utils";
import { PORTAL_CARD_CLASS, PORTAL_GREETING_CLASS, PORTAL_MUTED_CLASS } from "../lib/portal-styles";
import { useClientPortal } from "../providers/ClientPortalProvider";
import PortalEmptyState from "../components/PortalEmptyState";
import PortalPrimaryButton from "../components/PortalPrimaryButton";
import PortalStatusBadge from "../components/PortalStatusBadge";

export default function ClientDashboardView() {
  const { profile, unreadCount } = useClientPortal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchClientOrders()
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load bookings"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const portalOrders = useMemo(() => orders.map(mapClientOrderToPortal), [orders]);
  const nextRaw = useMemo(() => getNextUpcomingOrder(orders), [orders]);
  const nextOrder = nextRaw ? mapClientOrderToPortal(nextRaw) : null;
  const repeatSource = portalOrders[0] ?? null;
  const recentOrders = portalOrders.slice(0, 3);
  const greetingName = profile ? getGreetingName(profile.fullName) : "there";

  if (loading) return <div className="py-16 text-center text-sm text-slate-500">Loading your bookings…</div>;
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className={PORTAL_MUTED_CLASS}>{getTimeGreeting()}, {greetingName}</p>
          <h1 className={`${PORTAL_GREETING_CLASS} mt-1`}>Your cleanings</h1>
          <p className="mt-2 text-sm text-slate-500">Everything important, all in one place.</p>
        </div>
        <Link href="/app/client/notifications" className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#34597E]" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" /> : null}
        </Link>
      </header>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Next cleaning</h2>
        {nextOrder ? (
          <div className={`${PORTAL_CARD_CLASS} p-5 sm:p-6`}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-900">{nextOrder.serviceName}</h3>
                  <PortalStatusBadge label={nextOrder.statusLabel} status={nextOrder.status} size="sm" />
                </div>
                <p className="mt-3 font-medium text-slate-700">{nextOrder.dayLabel}, {nextOrder.scheduledDate} · {nextOrder.timeRange}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4" />{nextOrder.address.line}, {nextOrder.address.city}</p>
              </div>
              <Link href={`/app/client/orders/${nextOrder.id}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d4d6f]">
                View booking <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <PortalEmptyState title="No upcoming cleaning" description="Choose a service and a convenient time." action={<PortalPrimaryButton href="/booking?from=client-portal">New booking</PortalPrimaryButton>} />
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <ActionCard href="/booking?from=client-portal" icon={<CalendarPlus className="h-5 w-5" />} title="New booking" description="Choose another cleaning service" primary />
        {repeatSource ? <ActionCard href={buildRepeatBookingHref(repeatSource)} icon={<Repeat2 className="h-5 w-5" />} title="Repeat a booking" description="Reuse service and address" /> : null}
      </section>

      {recentOrders.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Recent bookings</h2>
            <Link href="/app/client/orders" className="text-sm font-semibold text-[#34597E] hover:underline">See all</Link>
          </div>
          <div className={`${PORTAL_CARD_CLASS} divide-y divide-slate-100 overflow-hidden`}>
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/app/client/orders/${order.id}`} className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{order.serviceName}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.scheduledDate} · {order.timeRange} · {order.address.city}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <PortalStatusBadge label={order.statusLabel} status={order.status} size="sm" />
                  <span className="font-semibold text-slate-800">{formatPortalMoney(order.price, order.currency)}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ActionCard({ href, icon, title, description, primary = false }: { href: string; icon: React.ReactNode; title: string; description: string; primary?: boolean }) {
  return (
    <Link href={href} className={`${PORTAL_CARD_CLASS} group flex items-center gap-4 p-5 transition hover:border-[#C5D9EB]`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${primary ? "bg-[#34597E] text-white" : "bg-[#EEF4FA] text-[#34597E]"}`}>{icon}</span>
      <span className="min-w-0 flex-1"><span className="block font-semibold text-slate-900">{title}</span><span className="mt-0.5 block text-sm text-slate-500">{description}</span></span>
      <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#34597E]" />
    </Link>
  );
}
