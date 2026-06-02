"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminDashboardApiResponse } from "@/features/dashboard/types/admin-dashboard.types";
import type { AdminDashboardData } from "@/features/dashboard/types/admin-dashboard.types";
import type { AdminScheduleApiResponse, AdminScheduleOrder } from "@/features/schedule/types/admin-schedule.types";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Euro,
  History,
  Search,
  Sparkles,
} from "lucide-react";

type LoadState = "loading" | "idle";

function formatMoney(value: number, currency: string): string {
  return `${value.toFixed(2)} ${currency}`;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function KpiCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {sub ? <p className="mt-0.5 text-xs text-slate-400">{sub}</p> : null}
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#34597E]">
          {icon}
        </span>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  actionHref,
  actionLabel,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#34597E]">
            {icon}
          </span>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="text-xs font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboard() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(todayIsoLocal());
  const [dayOrders, setDayOrders] = useState<AdminScheduleOrder[]>([]);
  const [dayOrdersLoading, setDayOrdersLoading] = useState(false);
  const [dayOrdersError, setDayOrdersError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoadState("loading");
    setError(null);

    try {
      const response = await fetch("/api/admin/dashboard", {
        credentials: "include",
      });
      const json = (await response.json()) as AdminDashboardApiResponse;

      if (!response.ok || json.error || !json.data) {
        setData(null);
        setError(json.error ?? "Failed to load dashboard");
        return;
      }

      setData(json.data);
    } catch {
      setData(null);
      setError("Failed to load dashboard");
    } finally {
      setLoadState("idle");
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    let cancelled = false;
    async function loadDayOrders() {
      setDayOrdersLoading(true);
      setDayOrdersError(null);
      try {
        const response = await fetch(`/api/admin/schedule?date=${scheduleDate}`, {
          credentials: "include",
        });
        const json = (await response.json()) as AdminScheduleApiResponse;
        if (cancelled) return;
        if (!response.ok || json.error || !json.data) {
          setDayOrders([]);
          setDayOrdersError(json.error ?? "Failed to load day orders");
          return;
        }

        const merged = [
          ...json.data.unassignedOrders,
          ...json.data.cleaners.flatMap((row) => row.orders),
        ];
        const deduped = Array.from(
          new Map(merged.map((order) => [order.id, order])).values()
        ).sort((a, b) => (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? ""));
        setDayOrders(deduped);
      } catch {
        if (!cancelled) {
          setDayOrders([]);
          setDayOrdersError("Failed to load day orders");
        }
      } finally {
        if (!cancelled) setDayOrdersLoading(false);
      }
    }
    void loadDayOrders();
    return () => {
      cancelled = true;
    };
  }, [scheduleDate]);

  const isLoading = loadState === "loading";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Daily operations overview for orders and team activity.
          </p>
        </div>
        <Link
          href="/app/admin/orders/new"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#34597E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(52,89,126,0.22)] transition hover:bg-[#2d4d6f]"
        >
          + New order
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Loading dashboard…
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <KpiCard
              label="Total orders"
              value={String(data.kpis.totalOrders)}
              icon={<ClipboardList className="h-5 w-5" />}
            />
            <KpiCard
              label="Today"
              value={String(data.kpis.todayOrders)}
              sub="Scheduled today"
              icon={<CalendarClock className="h-5 w-5" />}
            />
            <KpiCard
              label="Searching cleaner"
              value={String(data.kpis.searchingCleaner)}
              icon={<Search className="h-5 w-5" />}
            />
            <KpiCard
              label="In progress"
              value={String(data.kpis.inProgress)}
              icon={<Sparkles className="h-5 w-5" />}
            />
            <KpiCard
              label="Completed this week"
              value={String(data.kpis.completedThisWeek)}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <KpiCard
              label="Revenue this week"
              value={formatMoney(data.kpis.revenueThisWeek, data.kpis.currency)}
              sub="Completed bookings"
              icon={<Euro className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Orders needing attention"
              icon={<AlertCircle className="h-4 w-4" />}
              actionHref="/app/admin/orders?assigned=unassigned"
              actionLabel="View orders"
            >
              {data.attentionOrders.length === 0 ? (
                <p className="text-sm text-slate-500">Nothing urgent right now.</p>
              ) : (
                <ul className="space-y-2">
                  {data.attentionOrders.map((order) => (
                    <li key={order.orderId}>
                      <Link
                        href={`/app/admin/orders/${order.orderId}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-[#F6F8FB]/60 px-3 py-2.5 transition hover:border-[#C5D9EB] hover:bg-[#EEF4FA]"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            #{order.displayId} · {order.clientName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {order.attentionReason} · {order.serviceLabel}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Day schedule"
              icon={<CalendarClock className="h-4 w-4" />}
              actionHref={`/app/admin/schedule?date=${scheduleDate}`}
              actionLabel="Open day in schedule"
            >
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="mt-1 block rounded-xl border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-700"
                  />
                </label>
                <Link
                  href={`/app/admin/orders?date_from=${scheduleDate}&date_to=${scheduleDate}`}
                  className="text-xs font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
                >
                  Open day in orders
                </Link>
              </div>

              {dayOrdersLoading ? (
                <p className="text-sm text-slate-500">Loading orders for selected day...</p>
              ) : dayOrdersError ? (
                <p className="text-sm text-rose-700">{dayOrdersError}</p>
              ) : dayOrders.length === 0 ? (
                <p className="text-sm text-slate-500">No orders scheduled for this day.</p>
              ) : (
                <ul className="space-y-2">
                  {dayOrders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/app/admin/orders/${order.id}`}
                        className="block rounded-2xl border border-slate-200/80 px-3 py-2.5 transition hover:border-[#C5D9EB] hover:bg-[#EEF4FA]/50"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-[#34597E]">
                            {order.scheduledTime}
                          </span>
                          <span className="text-sm font-medium text-slate-800">
                            {order.client.name}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.serviceTypeLabel}
                          {order.address.city ? ` · ${order.address.city}` : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Recent activity"
            icon={<History className="h-4 w-4" />}
          >
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500">No recent status changes.</p>
            ) : (
              <ul className="space-y-2">
                {data.recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-slate-200/80 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/app/admin/orders/${item.orderId}`}
                        className="text-sm font-semibold text-[#34597E] hover:underline"
                      >
                        Order #{item.orderDisplayId}
                      </Link>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {item.isNote ? (
                        <span>
                          <span className="font-medium text-slate-700">Note</span>
                          {" · "}
                          {item.newStatusLabel}
                        </span>
                      ) : (
                        <span>
                          {item.oldStatusLabel}
                          <ArrowRight className="mx-1 inline h-3 w-3 text-slate-300" />
                          {item.newStatusLabel}
                        </span>
                      )}
                      <span className="text-slate-400"> · {item.actorName}</span>
                    </p>
                    {item.comment ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {item.comment}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
