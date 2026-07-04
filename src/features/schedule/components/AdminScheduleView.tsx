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
import {
  ADMIN_CARD_CLASS,
  ADMIN_CHIP_CLASS,
  ADMIN_PAGE_STACK_CLASS,
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_CLASS,
} from "@/lib/admin-styles";

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
      className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${styles.border} ${styles.bg}`}
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
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          {order.address.line}, {order.address.city}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:shrink-0 sm:items-end">
        <span
          className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles.border} ${styles.text}`}
        >
          {order.statusLabel}
        </span>
        <Link
          href={`/app/admin/orders/${order.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#34597E] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2d4d6f] sm:w-auto sm:py-1.5"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {t("orders.assignCleaner")}
        </Link>
      </div>
    </div>
  );
}

function ScheduleCleanerMobileOrders({
  row,
}: {
  row: AdminScheduleCleanerRow;
}) {
  const { t } = useT();
  const { cleaner, orders } = row;

  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF4FA] text-sm font-bold text-[#34597E]">
          {cleaner.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cleaner.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            cleaner.fullName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{cleaner.fullName}</p>
          <p className="truncate text-xs text-slate-500">{cleaner.city ?? "—"}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-center text-xs text-slate-500">
          {t("schedule.noOrdersForCleaner")}
        </p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const styles = scheduleStatusStyles(String(order.status));
            return (
              <Link
                key={order.id}
                href={`/app/admin/orders/${order.id}`}
                className={`block rounded-2xl border px-3 py-3 transition hover:shadow-sm ${styles.border} ${styles.bg}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm font-semibold ${styles.text}`}>
                    {order.scheduledTime}
                  </span>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${styles.border} ${styles.text} bg-white/70`}
                  >
                    {order.statusLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-800">{order.client.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {order.serviceTypeLabel}
                  {order.address.city ? ` · ${order.address.city}` : ""}
                </p>
              </Link>
            );
          })}
        </div>
      )}
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
    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 py-4 last:border-b-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-4">
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

      <div className="relative min-h-[72px] overflow-x-auto rounded-2xl border border-slate-100 bg-[#F6F8FB]/50">
        <div className="pointer-events-none absolute inset-0 grid min-w-[480px] grid-cols-12">
          {hours.slice(0, -1).map((hour) => (
            <div
              key={hour}
              className="border-r border-slate-200/60 last:border-r-0"
            />
          ))}
        </div>
        <div className="relative h-[72px] min-w-[480px] px-1">
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
    <div className={ADMIN_PAGE_STACK_CLASS}>
      <div>
        <h1 className={ADMIN_PAGE_TITLE_CLASS}>{t("schedule.title")}</h1>
        <p className={ADMIN_PAGE_SUBTITLE_CLASS}>{t("schedule.subtitle")}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className={`${ADMIN_CHIP_CLASS} bg-white text-slate-600 ring-slate-200`}>
            {formatOrderDate(date)}
            {isToday ? ` · ${t("common.today")}` : ""}
          </span>
          {schedule ? (
            <>
              <span className={`${ADMIN_CHIP_CLASS} bg-emerald-50 text-emerald-700 ring-emerald-200`}>
                {freeCount} {t("schedule.free")}
              </span>
              {overlapCount > 0 ? (
                <span className={`${ADMIN_CHIP_CLASS} bg-amber-50 text-amber-800 ring-amber-200`}>
                  {overlapCount} {t("schedule.overlapCount")}
                </span>
              ) : null}
              <span className={`${ADMIN_CHIP_CLASS} bg-[#EEF4FA] text-[#34597E] ring-[#C5D9EB]`}>
                {schedule.unassignedOrders.length} {t("schedule.unassigned")}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className={`${ADMIN_CARD_CLASS} space-y-2`}>
        <button
          type="button"
          onClick={() => goToDay(todayIsoLocal())}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#34597E] px-3 py-[clamp(0.25rem,1vh,0.5rem)] text-[clamp(0.625rem,2.4vmin,0.875rem)] font-semibold text-white shadow-sm transition hover:bg-[#2d4d6f] sm:w-auto"
        >
          <CalendarDays className="h-4 w-4" />
          {t("common.today")}
        </button>

        <div className="flex items-end gap-1.5">
          <button
            type="button"
            onClick={() => goToDay(addDaysIso(date, -1))}
            className="inline-flex h-[clamp(2rem,7vmin,2.75rem)] w-[clamp(2rem,7vmin,2.75rem)] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label={t("schedule.previousDay")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goToDay(addDaysIso(date, 1))}
            className="inline-flex h-[clamp(2rem,7vmin,2.75rem)] w-[clamp(2rem,7vmin,2.75rem)] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label={t("schedule.nextDay")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <label className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {t("common.date")}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => goToDay(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-[#5B8DB8]/50 focus:ring-2 focus:ring-[#5B8DB8]/10"
            />
          </label>
        </div>

        <label className="block w-full">
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
          <section className="rounded-3xl border border-amber-200/80 bg-linear-to-br from-amber-50/80 to-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-900/80 sm:text-sm">
                  {t("common.unassignedOrders")}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {t("schedule.unassignedSubtitle")}
                </p>
              </div>
              <Clock className="h-5 w-5 shrink-0 text-amber-600/70" aria-hidden />
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
            <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">
                {t("schedule.cleanerTimeline")}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {hours[0]}:00 – {hours[hours.length - 1]}:00 · default{" "}
                {schedule.cleaners[0]?.orders[0]?.estimatedDurationMinutes ?? 180}{" "}
                {t("schedule.defaultMinutesPerJob")}
              </p>
            </div>

            <div className="px-4 lg:hidden">
              {schedule.cleaners.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {t("schedule.noCleanersMatch")}
                </p>
              ) : (
                schedule.cleaners.map((row) => (
                  <ScheduleCleanerMobileOrders key={row.cleaner.id} row={row} />
                ))
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 border-b border-slate-100 bg-[#F6F8FB]/40 px-4 py-2">
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
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
