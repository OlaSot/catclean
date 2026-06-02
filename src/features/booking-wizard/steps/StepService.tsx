"use client";

import type { BookingServicePreset } from "../booking-wizard.types";

const OPTIONS: Array<{ id: BookingServicePreset; title: string; subtitle: string }> = [
  { id: "home_reset", title: "Home Reset", subtitle: "Deep apartment refresh" },
  { id: "move_out", title: "Move Out Cleaning", subtitle: "Deposit-safe cleaning" },
  { id: "regular_cleaning", title: "Regular Cleaning", subtitle: "Weekly or bi-weekly care" },
];

type Props = {
  value: BookingServicePreset | null;
  onChange: (next: BookingServicePreset) => void;
  error?: string;
};

export function StepService({ value, onChange, error }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">What do you need today?</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {OPTIONS.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-3xl border p-6 text-left transition ${
                selected
                  ? "border-[#34597E] bg-[#34597E]/10 shadow-[0_12px_28px_rgba(52,89,126,0.22)]"
                  : "border-slate-200 bg-white/90 hover:border-[#8baecc]"
              }`}
            >
              <p className="text-2xl font-bold text-slate-700">{item.title}</p>
              <p className="mt-1 text-slate-500">{item.subtitle}</p>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
