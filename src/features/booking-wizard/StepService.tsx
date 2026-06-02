"use client";

import type { BookingServicePreset } from "./types";

const OPTIONS: Array<{ id: BookingServicePreset; title: string; subtitle: string }> = [
  { id: "home_reset", title: "Home Reset", subtitle: "Deep apartment refresh" },
  { id: "move_out", title: "Move Out Cleaning", subtitle: "Deposit-safe cleaning" },
  { id: "regular_cleaning", title: "Regular Cleaning", subtitle: "Weekly or bi-weekly care" },
];

type StepServiceProps = {
  value: BookingServicePreset | null;
  onChange: (value: BookingServicePreset) => void;
  error?: string;
};

export function StepService({ value, onChange, error }: StepServiceProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">What do you need today?</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-3xl border p-6 text-left transition-all ${
                selected
                  ? "border-[#34597E] bg-[#34597E]/10 shadow-[0_12px_28px_rgba(52,89,126,0.22)]"
                  : "border-slate-200 bg-white/90 hover:border-[#8baecc]"
              }`}
            >
              <p className="text-2xl font-bold text-[var(--color-slate-700)]">{option.title}</p>
              <p className="mt-1 text-slate-500">{option.subtitle}</p>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
