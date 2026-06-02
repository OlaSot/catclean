"use client";

import type { BookingExtras } from "./types";

const EXTRA_OPTIONS: Array<{ key: keyof BookingExtras; label: string }> = [
  { key: "ovenCleaning", label: "Oven cleaning" },
  { key: "fridgeCleaning", label: "Fridge cleaning" },
  { key: "insideCabinets", label: "Inside cabinets" },
  { key: "balcony", label: "Balcony" },
  { key: "windows", label: "Windows" },
  { key: "pets", label: "Pets" },
];

type StepExtrasProps = {
  value: BookingExtras;
  onChange: (next: BookingExtras) => void;
};

export function StepExtras({ value, onChange }: StepExtrasProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Extras</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXTRA_OPTIONS.map((option) => {
          const checked = value[option.key];
          return (
            <label
              key={option.key}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                checked ? "border-[#34597E] bg-[#34597E]/10" : "border-slate-200 bg-white/90"
              }`}
            >
              <span className="text-lg font-medium text-slate-700">{option.label}</span>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  onChange({
                    ...value,
                    [option.key]: event.target.checked,
                  })
                }
                className="h-5 w-5 accent-[#34597E]"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
