"use client";

import type { BookingSchedule } from "./types";

type StepScheduleProps = {
  value: BookingSchedule;
  onChange: (value: BookingSchedule) => void;
  errors?: Partial<Record<keyof BookingSchedule, string>>;
};

export function StepSchedule({ value, onChange, errors }: StepScheduleProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Date &amp; Time</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Date</span>
          <input
            type="date"
            value={value.date}
            onChange={(event) => onChange({ ...value, date: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.date ? <p className="mt-1 text-sm text-rose-600">{errors.date}</p> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Time</span>
          <input
            type="time"
            value={value.time}
            onChange={(event) => onChange({ ...value, time: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.time ? <p className="mt-1 text-sm text-rose-600">{errors.time}</p> : null}
        </label>
      </div>
    </div>
  );
}
