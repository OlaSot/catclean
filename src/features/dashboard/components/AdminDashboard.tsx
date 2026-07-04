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
import {
  ADMIN_CARD_CLASS,
  ADMIN_PAGE_HEADER_ROW_CLASS,
  ADMIN_PAGE_STACK_CLASS,
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_CLASS,
  ADMIN_PRIMARY_ACTION_CLASS,
} from "@/lib/admin-styles";

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
    <div className={`${ADMIN_CARD_CLASS} min-w-0`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[clamp(0.5625rem,2vmin,0.6875rem)] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-0.5 text-[clamp(1rem,4.5vmin,1.5rem)] font-semibold leading-none tracking-tight text-slate-900">
            {value}
          </p>
          {sub ? (
            <p className="mt-0.5 line-clamp-2 text-[clamp(0.5625rem,2vmin,0.6875rem)] text-slate-400">
              {sub}
            </p>
          ) : null}
        </div>
        <span className="inline-flex h-[clamp(1.75rem,7vmin,2.5rem)] w-[clamp(1.75rem,7vmin,2.5rem)] shrink-0 items-center justify-center rounded-xl bg-[#EEF4FA] text-[#34597E] [&_svg]:h-[clamp(0.875rem,3.5vmin,1.25rem)] [&_svg]:w-[clamp(0.875rem,3.5vmin,1.25rem)]">
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
    <section className={`${ADMIN_CARD_CLASS} min-w-0`}>
      <div className="mb-[clamp(0.375rem,1.2vh,1rem)] flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-[clamp(1.5rem,6vmin,2rem)] w-[clamp(1.5rem,6vmin,2rem)] shrink-0 items-center justify-center rounded-lg bg-[#EEF4FA] text-[#34597E] [&_svg]:h-3.5 [&_svg]:w-3.5">
            {icon}
          </span>
          <h2 className="min-w-0 text-[clamp(0.6875rem,2.8vmin,0.875rem)] font-semibold leading-snug text-slate-800">
            {title}
          </h2>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="shrink-0 text-xs font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
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
        setError(json.error ?? "Не удалось загрузить дашборд");
        return;
      }

      setData(json.data);
    } catch {
      setData(null);
      setError("Не удалось загрузить дашборд");
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
          setDayOrdersError(json.error ?? "Не удалось загрузить заказы на день");
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
          setDayOrdersError("Не удалось загрузить заказы на день");
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
    <div className={ADMIN_PAGE_STACK_CLASS}>
      <div className={ADMIN_PAGE_HEADER_ROW_CLASS}>
        <div>
          <h1 className={ADMIN_PAGE_TITLE_CLASS}>
            Дашборд
          </h1>
          <p className={ADMIN_PAGE_SUBTITLE_CLASS}>
            Ежедневный операционный обзор заказов и активности команды.
          </p>
        </div>
        <Link href="/app/admin/orders/new" className={ADMIN_PRIMARY_ACTION_CLASS}>
          + Новый заказ
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Загрузка дашборда…
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <div className="grid grid-cols-3 gap-[clamp(0.25rem,1vh,0.75rem)] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <KpiCard
              label="Всего заказов"
              value={String(data.kpis.totalOrders)}
              icon={<ClipboardList className="h-5 w-5" />}
            />
            <KpiCard
              label="Сегодня"
              value={String(data.kpis.todayOrders)}
              sub="Запланировано на сегодня"
              icon={<CalendarClock className="h-5 w-5" />}
            />
            <KpiCard
              label="Ищем клинера"
              value={String(data.kpis.searchingCleaner)}
              icon={<Search className="h-5 w-5" />}
            />
            <KpiCard
              label="В работе"
              value={String(data.kpis.inProgress)}
              icon={<Sparkles className="h-5 w-5" />}
            />
            <KpiCard
              label="Завершено за неделю"
              value={String(data.kpis.completedThisWeek)}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <KpiCard
              label="Выручка за неделю"
              value={formatMoney(data.kpis.revenueThisWeek, data.kpis.currency)}
              sub="Завершенные бронирования"
              icon={<Euro className="h-5 w-5" />}
            />
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-[clamp(0.375rem,1.2vh,1rem)] lg:grid-cols-2">
            <SectionCard
              title="Заказы, требующие внимания"
              icon={<AlertCircle className="h-4 w-4" />}
              actionHref="/app/admin/orders?assigned=unassigned"
              actionLabel="Открыть заказы"
            >
              {data.attentionOrders.length === 0 ? (
                <p className="text-sm text-slate-500">Сейчас срочных заказов нет.</p>
              ) : (
                <ul className="space-y-2">
                  {data.attentionOrders.map((order) => (
                    <li key={order.orderId}>
                      <Link
                        href={`/app/admin/orders/${order.orderId}`}
                        className="block min-w-0 rounded-2xl border border-slate-200/80 bg-[#F6F8FB]/60 px-3 py-3 transition hover:border-[#C5D9EB] hover:bg-[#EEF4FA]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 text-sm font-semibold leading-snug text-slate-800">
                            <span className="text-[#34597E]">#{order.displayId}</span>
                            <span className="text-slate-400"> · </span>
                            <span className="break-words">{order.clientName}</span>
                          </p>
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        </div>
                        <p className="mt-2 inline-flex max-w-full rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium leading-snug text-amber-900 ring-1 ring-amber-200/80">
                          {order.attentionReason}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                          {order.serviceLabel}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Расписание на день"
              icon={<CalendarClock className="h-4 w-4" />}
              actionHref={`/app/admin/schedule?date=${scheduleDate}`}
              actionLabel="Открыть день в расписании"
            >
              <div className="mb-3 flex flex-col gap-3">
                <label className="block w-full text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Дата
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-2.5 py-2.5 text-sm font-medium text-slate-700"
                  />
                </label>
                <Link
                  href={`/app/admin/orders?date_from=${scheduleDate}&date_to=${scheduleDate}`}
                  className="text-xs font-semibold text-[#34597E] transition hover:text-[#2d4d6f]"
                >
                  Открыть день в заказах
                </Link>
              </div>

              {dayOrdersLoading ? (
                <p className="text-sm text-slate-500">Загрузка заказов на выбранный день...</p>
              ) : dayOrdersError ? (
                <p className="text-sm text-rose-700">{dayOrdersError}</p>
              ) : dayOrders.length === 0 ? (
                <p className="text-sm text-slate-500">На этот день заказы не запланированы.</p>
              ) : (
                <ul className="space-y-2">
                  {dayOrders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/app/admin/orders/${order.id}`}
                        className="block min-w-0 rounded-2xl border border-slate-200/80 px-3 py-3 transition hover:border-[#C5D9EB] hover:bg-[#EEF4FA]/50"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="inline-flex shrink-0 rounded-full bg-[#EEF4FA] px-2.5 py-1 text-sm font-semibold text-[#34597E]">
                            {order.scheduledTime}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-snug text-slate-800">
                              {order.client.name}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              {order.serviceTypeLabel}
                              {order.address.city ? ` · ${order.address.city}` : ""}
                            </p>
                          </div>
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Недавняя активность"
            icon={<History className="h-4 w-4" />}
          >
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500">Недавних смен статуса нет.</p>
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
                        Заказ #{item.orderDisplayId}
                      </Link>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {item.isNote ? (
                        <span>
                          <span className="font-medium text-slate-700">Заметка</span>
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
