"use client";

import { useEffect, useRef } from "react";
import type { BookingWizardState } from "../booking-wizard.types";
import {
  earliestPublicBookingBerlin,
  isPublicBookingSlotTooSoon,
} from "@/lib/booking/berlin-datetime";
import { useNowTick } from "@/lib/booking/use-now-tick";

type Schedule = BookingWizardState["schedule"];

type Props = {
  value: Schedule;
  onChange: (next: Schedule) => void;
  errors?: Partial<Record<keyof Schedule, string>>;
};

export function StepSchedule({ value, onChange, errors }: Props) {
  const now = useNowTick();
  const earliest = earliestPublicBookingBerlin(now);
  const minTime = value.date === earliest.dateKey ? earliest.timeHm : undefined;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (value.date && value.time && isPublicBookingSlotTooSoon(value.date, value.time, now)) {
      onChangeRef.current({ date: value.date, time: "" });
    }
  }, [now, value.date, value.time]);

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Date &amp; time</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Date</span>
          <input
            type="date"
            min={earliest.dateKey}
            value={value.date}
            onChange={(e) => {
              const date = e.target.value;
              const time =
                value.time && isPublicBookingSlotTooSoon(date, value.time, now)
                  ? ""
                  : value.time;
              onChange({ date, time });
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.date ? <p className="mt-1 text-sm text-rose-600">{errors.date}</p> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Time</span>
          <input
            type="time"
            min={minTime}
            step={900}
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.time ? <p className="mt-1 text-sm text-rose-600">{errors.time}</p> : null}
        </label>
      </div>
    </div>
  );
}
