"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserPlus,
} from "lucide-react";
import { StyledSelect } from "@/components/ui/StyledSelect";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import type {
  AdminScheduleCleanerRow,
  AdminScheduleData,
  AdminScheduleOrder,
} from "@/features/schedule/types/admin-schedule.types";
import type { AdminScheduleApiResponse } from "@/features/schedule/types/admin-schedule.types";
import type { AdminCleanersApiResponse } from "@/features/orders/types/admin-cleaners-api.types";
import { formatOrderDate } from "@/features/orders/lib/format-order-display";
import {
  addDaysIso,
  minutesToTimelinePercent,
  scheduleTimelineHours,
  todayIsoLocal,
} from "@/features/schedule/lib/schedule-time";
import { scheduleStatusStyles } from "@/features/schedule/lib/schedule-status-styles";
import { useT } from "@/i18n/useT";

type LoadState = "loading" | "idle";

function buildScheduleQuery(date: string, cleanerId: string): string {
  const params = new URLSearchParams();
  params.set("date", date);
  if (cleanerId) params.set("cleaner_id", cleanerId);
  return `/api/admin/schedule?${params.toString()}`;
}

function ScheduleOrderBlock({
  order,
  compact,
}: {
  order: AdminScheduleOrder;
  compact?: boolean;
}) {
  const styles = scheduleStatusStyles(String(order.status));
  const start = order.startMinutes;
  const duration = order.estimatedDurationMinutes;

  const position =
    start != null
      ? minutesToTimelinePercent(start, duration)
      : { left: 0, width: 12 };

  return (
    <Link
      href={`/app/admin/orders/${order.id}`}
      className={`absolute top-1 bottom-1 overflow-hidden rounded-xl border px-2 py-1.5 shadow-sm transition hover:shadow-md ${styles.border} ${styles.bg}`}
      style={{
        left: `${position.left}%`,
        width: `${position.width}%`,
        minWidth: compact ? "72px" : "96px",
      }}
      title={`${order.scheduledTime} · ${order.client.name}`}
    >
      <p className={`truncate text-[11px] font-semibold ${styles.text}`}>
        {order.scheduledTime}
      </p>
      <p className="truncate text-[11px] font-medium text-slate-800">
        {order.client.name}
      </p>
      {!compact ? (
        <>
          <p className="truncate text-[10px] text-slate-500">
            {order.serviceTypeLabel}
          </p>
          <p className="truncate text-[10px] text-slate-400">
            {order.address.city}
          </p>
        </>
      ) : null}
      <span
        className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold ring-1 ${styles.border} ${styles.text} bg-white/60`}
      >
        {order.statusLabel}
      </span>
    </Link>
  );
}

function UnassignedCard({ order }: { order: AdminScheduleOrder }) {
  const { t } = useT();
  const styles = scheduleStatusStyles(String(order.status));

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${styles.border} ${styles.bg}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          <span className="text-[#34597E]">{order.scheduledTime}</span>
          <span className="mx-2 text-slate-300">·</span>
          #{order.displayId}
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          {order.client.name} · {order.serviceTypeLabel}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {order.address.line}, {order.address.city}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles.border} ${styles.text}`}
        >
          {order.statusLabel}
        </span>
        <Link
          href={`/app/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#34597E] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2d4d6f]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {t("orders.assignCleaner")}
        </Link>
      </div>
    </div>
  );
}

function CleanerScheduleRow({ row }: { row: AdminScheduleCleanerRow }) {
  const { t } = useT();
  const {
    cleaner,
    orders,
    totalOrdersToday,
    totalHoursToday,
    hasOverlap,
    isFree,
    exceedsMaxHours,
    exceedsMaxOrders,
  } = row;
  const hours = scheduleTimelineHours();
  const availabilityLabel =
    cleaner.availabilityStatus === "vacation"
      ? t("schedule.vacation")
      : cleaner.availabilityStatus === "sick"
        ? t("schedule.sick")
        : cleaner.availabilityStatus === "unavailable"
          ? t("schedule.unavailable")
          : cleaner.availabilityStatus === "preferred_day_off"
            ? t("schedule.dayOff")
            : cleaner.availabilityStatus === "available"
              ? t("common.available")
              : null;

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF4FA] text-sm font-bold text-[#34597E]">
            {cleaner.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cleaner.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              cleaner.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {cleaner.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {cleaner.city ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {isFree ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              {t("common.available")}
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {totalOrdersToday} {t("nav.orders").toLowerCase()}
            </span>
          )}
          <span className="inline-flex rounded-full bg-[#EEF4FA] px-2 py-0.5 text-[10px] font-semibold text-[#34597E]">
            {totalHoursToday}{t("common.hoursShort")}
          </span>
          {availabilityLabel ? (
            <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
              {availabilityLabel}
            </span>
          ) : null}
          {hasOverlap ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
              <AlertTriangle className="h-3 w-3" />
              {t("common.overlap")}
            </span>
          ) : null}
          {exceedsMaxHours || exceedsMaxOrders ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200">
              <AlertTriangle className="h-3 w-3" />
              {t("schedule.overload")}
            </span>
          ) : null}
          {!cleaner.isAcceptingOrders ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
              {t("schedule.notAccepting")}
            </span>
          ) : null}
        </div>
        {cleaner.availabilityNote ? (
          <p className="text-[11px] text-slate-500">{cleaner.availabilityNote}</p>
        ) : null}
      </div>

      <div className="relative min-h-[72px] rounded-2xl border border-slate-100 bg-[#F6F8FB]/50">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-12">
          {hours.slice(0, -1).map((hour) => (
            <div
              key={hour}
              className="border-r border-slate-200/60 last:border-r-0"
            />
          ))}
        </div>
        <div className="relative h-[72px] px-1">
          {orders.map((order) => (
            <ScheduleOrderBlock key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminScheduleView() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialDate = searchParams.get("date") ?? todayIsoLocal();
  const initialCleaner = searchParams.get("cleaner_id") ?? "";

  const [date, setDate] = useState(initialDate);
  const [cleanerId, setCleanerId] = useState(initialCleaner);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [schedule, setSchedule] = useState<AdminScheduleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cleaners, setCleaners] = useState<ActiveCleaner[]>([]);

  const syncUrl = useCallback(
    (nextDate: string, nextCleanerId: string) => {
      const params = new URLSearchParams();
      params.set("date", nextDate);
      if (nextCleanerId) params.set("cleaner_id", nextCleanerId);
      router.replace(`/app/admin/schedule?${params.toString()}`);
    },
    [router]
  );

  const loadSchedule = useCallback(async (d: string, c: string) => {
    setLoadState("loading");
    setError(null);

    try {
      const response = await fetch(buildScheduleQuery(d, c), {
        credentials: "include",
      });
      const json = (await response.json()) as AdminScheduleApiResponse;

      if (!response.ok || json.error || !json.data) {
        setSchedule(null);
        setError(json.error ?? "Failed to load schedule");
        return;
      }

      setSchedule(json.data);
    } catch {
      setSchedule(null);
      setError("Failed to load schedule");
    } finally {
      setLoadState("idle");
    }
  }, []);

  useEffect(() => {
    void loadSchedule(date, cleanerId);
  }, [date, cleanerId, loadSchedule]);

  useEffect(() => {
    async function loadCleaners() {
      try {
        const response = await fetch("/api/admin/cleaners?status=active", {
          credentials: "include",
        });
        const json = (await response.json()) as AdminCleanersApiResponse;
        if (response.ok && json.data) {
          setCleaners(json.data);
        }
      } catch {
        setCleaners([]);
      }
    }
    void loadCleaners();
  }, []);

  const cleanerOptions = useMemo(
    () => [
      { value: "", label: t("schedule.allCleaners") },
      ...cleaners.map((c) => ({ value: c.id, label: c.name })),
    ],
    [cleaners, t]
  );

  const hours = scheduleTimelineHours();
  const isToday = date === todayIsoLocal();

  const freeCount = schedule?.cleaners.filter((c) => c.isFree).length ?? 0;
  const overlapCount =
    schedule?.cleaners.filter((c) => c.hasOverlap).length ?? 0;

  function goToDay(next: string) {
    setDate(next);
    syncUrl(next, cleanerId);
  }

  function handleCleanerChange(value: string) {
    setCleanerId(value);
    syncUrl(date, value);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            {t("schedule.title")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("schedule.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
            {formatOrderDate(date)}
            {isToday ? ` · ${t("common.today")}` : ""}
          </span>
          {schedule ? (
            <>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-200">
                {freeCount} {t("schedule.free")}
              </span>
              {overlapCount > 0 ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800 ring-1 ring-amber-200">
                  {overlapCount} {t("schedule.overlapCount")}
                </span>
              ) : null}
              <span className="rounded-full bg-[#EEF4FA] px-3 py-1 text-[#34597E] ring-1 ring-[#C5D9EB]">
                {schedule.unassignedOrders.length} {t("schedule.unassigned")}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        <button
          type="button"
          onClick={() => goToDay(todayIsoLocal())}
          className="inline-flex items-center gap-2 rounded-full bg-[#34597E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d4d6f]"
        >
          <CalendarDays className="h-4 w-4" />
          {t("common.today")}
        </button>
        <button
          type="button"
          onClick={() => goToDay(addDaysIso(date, -1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          aria-label={t("schedule.previousDay")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => goToDay(addDaysIso(date, 1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          aria-label={t("schedule.nextDay")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {t("common.date")}
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => goToDay(e.target.value)}
            className="mt-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-[#5B8DB8]/50 focus:ring-2 focus:ring-[#5B8DB8]/10"
          />
        </label>
        <label className="block min-w-[200px]">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {t("common.cleaner")}
          </span>
          <StyledSelect
            value={cleanerId}
            options={cleanerOptions}
            onChange={handleCleanerChange}
            className="mt-1.5"
          />
        </label>
      </div>

      {loadState === "loading" ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center text-sm text-slate-500 shadow-sm">
          {t("schedule.loading")}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loadState === "idle" && schedule ? (
        <>
          <section className="rounded-3xl border border-amber-200/80 bg-linear-to-br from-amber-50/80 to-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900/80">
                  {t("common.unassignedOrders")}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t("schedule.unassignedSubtitle")}
                </p>
              </div>
              <Clock className="h-5 w-5 text-amber-600/70" aria-hidden />
            </div>
            {schedule.unassignedOrders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-amber-200/80 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
                {t("schedule.allAssignedForDay")}
              </p>
            ) : (
              <div className="space-y-2">
                {schedule.unassignedOrders.map((order) => (
                  <UnassignedCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t("schedule.cleanerTimeline")}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {hours[0]}:00 – {hours[hours.length - 1]}:00 · default{" "}
                {schedule.cleaners[0]?.orders[0]?.estimatedDurationMinutes ?? 180}{" "}
                {t("schedule.defaultMinutesPerJob")}
              </p>
            </div>

            <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-4 border-b border-slate-100 bg-[#F6F8FB]/40 px-4 py-2">
              <div className="text-xs font-semibold text-slate-500">{t("common.cleaner")}</div>
              <div className="grid grid-cols-12 text-center text-[10px] font-semibold text-slate-400">
                {hours.slice(0, -1).map((hour) => (
                  <div key={hour}>{String(hour).padStart(2, "0")}:00</div>
                ))}
              </div>
            </div>

            <div className="px-4">
              {schedule.cleaners.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  {t("schedule.noCleanersMatch")}
                </p>
              ) : (
                schedule.cleaners.map((row) => (
                  <CleanerScheduleRow key={row.cleaner.id} row={row} />
                ))
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
