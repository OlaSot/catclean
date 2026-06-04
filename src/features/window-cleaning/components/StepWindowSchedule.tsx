"use client";

import type { WindowCleaningSchedule } from "../window-cleaning.types";

type Props = {
  value: WindowCleaningSchedule;
  onChange: (next: WindowCleaningSchedule) => void;
  errors?: Partial<Record<keyof WindowCleaningSchedule, string>>;
};

export function StepWindowSchedule({ value, onChange, errors }: Props) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="max-w-2xl space-y-2">
        <p className="text-sm font-medium text-[#5B8DB8]">Window Cleaning</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-[2rem]">
          Date &amp; time
        </h1>
        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
          Pick a convenient date and time for your appointment.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:grid-cols-2 sm:p-6">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Date</span>
          <input
            type="date"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.date ? <p className="mt-1 text-sm text-rose-600">{errors.date}</p> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Time</span>
          <input
            type="time"
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.time ? <p className="mt-1 text-sm text-rose-600">{errors.time}</p> : null}
        </label>
      </div>
    </div>
  );
}
