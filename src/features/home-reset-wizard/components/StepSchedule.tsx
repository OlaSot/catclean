"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { WizardStepHeader } from "./WizardStepHeader";
import { getWeekdayLabels } from "@/i18n/public/schedule-i18n";
import type { HomeResetSchedule } from "../home-reset-wizard.types";
import { berlinTodayDateKey, isPublicBookingSlotTooSoon } from "@/lib/booking/berlin-datetime";
import { useNowTick } from "@/lib/booking/use-now-tick";
import { BOOKING_START_TIMES } from "@/lib/booking/booking-time-slots";

type Props = {
  value: HomeResetSchedule;
  onChange: (next: HomeResetSchedule) => void;
  durationMinutes?: number | null;
  errors?: Partial<Record<keyof HomeResetSchedule, string>>;
};

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string): Date | null {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function yearMonthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function buildMonthGrid(viewMonth: Date): Array<Date | null> {
  const first = startOfMonth(viewMonth);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function StepSchedule({ value, onChange, durationMinutes, errors }: Props) {
  const { t, locale } = usePublicI18n();
  const now = useNowTick();
  const selectedDate = parseDateKey(value.date);
  const [viewMonth, setViewMonth] = useState(() => selectedDate ?? startOfMonth(new Date()));
  const todayKey = berlinTodayDateKey(now);
  const todayHasBookableSlot = BOOKING_START_TIMES.some(
    (slot) => !isPublicBookingSlotTooSoon(todayKey, slot, now)
  );
  const todayDate = parseDateKey(todayKey) ?? new Date();
  const minMonth = startOfMonth(todayDate);
  const canGoPrev = yearMonthIndex(viewMonth) > yearMonthIndex(minMonth);
  const [availableTimes, setAvailableTimes] = useState<string[] | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const monthLabel = viewMonth.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
    month: "long",
    year: "numeric",
  });
  const weekdays = getWeekdayLabels(t);
  const grid = buildMonthGrid(viewMonth);

  useEffect(() => {
    if (!value.date) {
      setAvailableTimes(null);
      setAvailabilityLoading(false);
      setAvailabilityError(false);
      return;
    }

    const controller = new AbortController();
    const duration =
      durationMinutes && durationMinutes > 0 ? Math.round(durationMinutes) : 180;
    setAvailabilityLoading(true);
    setAvailableTimes(null);
    setAvailabilityError(false);

    fetch(
      `/api/public/booking-slots?date=${encodeURIComponent(value.date)}&durationMinutes=${duration}`,
      { signal: controller.signal }
    )
      .then(async (response) => {
        const body = (await response.json()) as {
          data: { availableTimes: string[] } | null;
          error: string | null;
        };
        if (!response.ok || body.error || !body.data) {
          throw new Error(body.error ?? "availability");
        }
        return body.data.availableTimes;
      })
      .then((times) => {
        setAvailableTimes(times);
        setAvailabilityLoading(false);
      })
      .catch((error: { name?: string }) => {
        if (error?.name === "AbortError") return;
        setAvailableTimes([]);
        setAvailabilityError(true);
        setAvailabilityLoading(false);
      });

    return () => controller.abort();
  }, [value.date, durationMinutes]);

  useEffect(() => {
    if (!value.time) return;
    if (value.date && isPublicBookingSlotTooSoon(value.date, value.time, now)) {
      onChangeRef.current({ date: value.date, time: "" });
      return;
    }
    if (availableTimes == null || availabilityLoading) return;
    if (!availableTimes.includes(value.time)) {
      onChangeRef.current({ date: value.date, time: "" });
    }
  }, [availableTimes, availabilityLoading, now, value.date, value.time]);

  function selectDate(date: Date) {
    const key = toDateKey(date);
    const nextTime =
      value.time && isPublicBookingSlotTooSoon(key, value.time, now) ? "" : value.time;
    onChange({ date: key, time: nextTime });
  }

  const selectableTimes = BOOKING_START_TIMES.filter((slot) => {
    if (value.date && isPublicBookingSlotTooSoon(value.date, slot, now)) return false;
    if (availableTimes == null) return !value.date;
    return availableTimes.includes(slot);
  });

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.wizard.schedule.eyebrow")}
        title={t("public.wizard.schedule.title")}
        subtitle={t("public.wizard.schedule.subtitle")}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => {
                if (!canGoPrev) return;
                setViewMonth((month) => addMonths(month, -1));
              }}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                canGoPrev
                  ? "cursor-pointer border-stone-200 text-slate-600 hover:border-[#34597E]/30 hover:text-[#34597E]"
                  : "cursor-not-allowed border-stone-100 text-slate-300"
              }`}
              aria-label={t("public.schedule.prevMonth")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-base font-semibold text-slate-800">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setViewMonth((month) => addMonths(month, 1))}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-stone-200 text-slate-600 transition hover:border-[#34597E]/30 hover:text-[#34597E]"
              aria-label={t("public.schedule.nextMonth")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((day) => (
              <div key={day} className="py-2 text-xs font-medium text-slate-400">
                {day}
              </div>
            ))}
            {grid.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const key = toDateKey(date);
              const isPast = key < todayKey || (key === todayKey && !todayHasBookableSlot);
              const isSelected = value.date === key;
              const isToday = key === todayKey;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDate(date)}
                  className={`aspect-square rounded-2xl text-sm font-medium transition ${
                    isSelected
                      ? "cursor-pointer bg-[#34597E] text-white shadow-[0_4px_16px_rgba(52,89,126,0.28)]"
                      : isPast
                        ? "cursor-not-allowed text-slate-300"
                        : isToday
                          ? "cursor-pointer border border-[#34597E]/30 text-[#34597E] hover:bg-[#34597E]/5"
                          : "cursor-pointer text-slate-700 hover:bg-stone-50"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {errors?.date ? <p className="mt-4 text-sm text-rose-600">{errors.date}</p> : null}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-600">{t("public.schedule.availableSlots")}</p>
          <p className="text-xs text-slate-400">{t("public.schedule.unavailableHint")}</p>
          <div className="grid grid-cols-2 gap-2">
            {BOOKING_START_TIMES.map((slot) => {
              const selected = value.time === slot;
              const slotPast =
                Boolean(value.date) && isPublicBookingSlotTooSoon(value.date, slot, now);
              const occupied =
                Boolean(value.date) &&
                !availabilityLoading &&
                availableTimes != null &&
                !availableTimes.includes(slot);
              const disabled = slotPast || occupied || (Boolean(value.date) && availabilityLoading);
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ ...value, time: slot })}
                  className={`rounded-2xl border px-3 py-2.5 text-center text-sm font-medium tabular-nums transition ${
                    selected
                      ? "cursor-pointer border-[#34597E]/40 bg-[#34597E]/[0.04] text-[#34597E] shadow-[0_0_0_1px_rgba(52,89,126,0.12)]"
                      : disabled
                        ? "cursor-not-allowed border-stone-100 bg-stone-50 text-slate-300"
                        : "cursor-pointer border-stone-200/90 bg-white text-slate-700 hover:border-stone-300"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          {availabilityError ? (
            <p className="text-sm text-rose-600">{t("public.schedule.availabilityError")}</p>
          ) : null}
          {value.date &&
          !availabilityLoading &&
          !availabilityError &&
          selectableTimes.length === 0 ? (
            <p className="text-sm text-rose-600">{t("public.schedule.noTimesAvailable")}</p>
          ) : null}
          {errors?.time ? <p className="text-sm text-rose-600">{errors.time}</p> : null}
        </div>
      </div>
    </div>
  );
}
