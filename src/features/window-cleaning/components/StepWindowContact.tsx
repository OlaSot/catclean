"use client";

import type { WindowCleaningContact } from "../window-cleaning.types";

type Props = {
  value: WindowCleaningContact;
  onChange: (next: WindowCleaningContact) => void;
  errors?: Partial<Record<keyof WindowCleaningContact, string>>;
};

export function StepWindowContact({ value, onChange, errors }: Props) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="max-w-2xl space-y-2">
        <p className="text-sm font-medium text-[#5B8DB8]">Window Cleaning</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-[2rem]">Contact</h1>
        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
          How can we reach you about your booking?
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:grid-cols-2 sm:p-6">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">Name</span>
          <input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Phone (required)</span>
          <input
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="+49 178 1234567"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.phone ? <p className="mt-1 text-sm text-rose-600">{errors.phone}</p> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Email (optional)</span>
          <input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.email ? <p className="mt-1 text-sm text-rose-600">{errors.email}</p> : null}
        </label>
      </div>
    </div>
  );
}
