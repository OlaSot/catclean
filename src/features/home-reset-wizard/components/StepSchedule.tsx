"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { WizardStepHeader } from "./WizardStepHeader";
import { getTimeSlotLabel, getWeekdayLabels } from "@/i18n/public/schedule-i18n";
import { TIME_SLOTS } from "../home-reset-wizard.constants";
import type { HomeResetSchedule } from "../home-reset-wizard.types";

type Props = {
  value: HomeResetSchedule;
  onChange: (next: HomeResetSchedule) => void;
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

export function StepSchedule({ value, onChange, errors }: Props) {
  const { t, locale } = usePublicI18n();
  const selectedDate = parseDateKey(value.date);
  const [viewMonth, setViewMonth] = useState(() => selectedDate ?? startOfMonth(new Date()));
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const monthLabel = viewMonth.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
    month: "long",
    year: "numeric",
  });
  const weekdays = getWeekdayLabels(t);
  const grid = buildMonthGrid(viewMonth);

  function selectDate(date: Date) {
    onChange({ ...value, date: toDateKey(date) });
  }

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.wizard.schedule.eyebrow")}
        title={t("public.wizard.schedule.title")}
        subtitle={t("public.wizard.schedule.subtitle")}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((month) => addMonths(month, -1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-slate-600 transition hover:border-[#34597E]/30 hover:text-[#34597E]"
              aria-label={t("public.schedule.prevMonth")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-base font-semibold text-slate-800">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setViewMonth((month) => addMonths(month, 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-slate-600 transition hover:border-[#34597E]/30 hover:text-[#34597E]"
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
              const isPast = date < today;
              const isSelected = value.date === key;
              const isToday = toDateKey(date) === toDateKey(today);

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isPast}
                  onClick={() => selectDate(date)}
                  className={`aspect-square rounded-2xl text-sm font-medium transition ${
                    isSelected
                      ? "bg-[#34597E] text-white shadow-[0_4px_16px_rgba(52,89,126,0.28)]"
                      : isPast
                        ? "cursor-not-allowed text-slate-300"
                        : isToday
                          ? "border border-[#34597E]/30 text-[#34597E] hover:bg-[#34597E]/5"
                          : "text-slate-700 hover:bg-stone-50"
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
          <div className="space-y-2">
            {TIME_SLOTS.map((slot) => {
              const selected = value.time === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onChange({ ...value, time: slot.id })}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    selected
                      ? "border-[#34597E]/40 bg-[#34597E]/[0.04] text-[#34597E] shadow-[0_0_0_1px_rgba(52,89,126,0.12)]"
                      : "border-stone-200/90 bg-white text-slate-700 hover:border-stone-300"
                  }`}
                >
                  {getTimeSlotLabel(t, slot.id)}
                </button>
              );
            })}
          </div>
          {errors?.time ? <p className="text-sm text-rose-600">{errors.time}</p> : null}
        </div>
      </div>
    </div>
  );
}
