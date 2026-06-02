"use client";

import type { BookingWizardState } from "../booking-wizard.types";

type Contact = BookingWizardState["contact"];

type Props = {
  value: Contact;
  onChange: (next: Contact) => void;
  errors?: Partial<Record<keyof Contact, string>>;
};

export function StepContact({ value, onChange, errors }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Contact</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-600">Name</span>
          <input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.name ? <p className="mt-1 text-sm text-rose-600">{errors.name}</p> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Phone (required)</span>
          <input
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="+49 178 1234567"
            className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.phone ? <p className="mt-1 text-sm text-rose-600">{errors.phone}</p> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Email (optional)</span>
          <input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
          />
          {errors?.email ? <p className="mt-1 text-sm text-rose-600">{errors.email}</p> : null}
        </label>
      </div>
    </div>
  );
}
