"use client";

import type { BookingExtras } from "../booking-wizard.types";

type Props = {
  value: BookingExtras;
  onChange: (next: BookingExtras) => void;
};

const ITEMS: Array<{ key: keyof BookingExtras; label: string; price?: string }> = [
  { key: "ovenCleaning", label: "Oven cleaning", price: "+25€" },
  { key: "fridgeCleaning", label: "Fridge cleaning", price: "+20€" },
  { key: "insideCabinets", label: "Inside cabinets", price: "+30€" },
  { key: "balcony", label: "Balcony", price: "+20€" },
  { key: "interiorWindows", label: "Interior windows" },
  { key: "changeBedLinen", label: "Change bed linen" },
];

export function StepExtras({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Would you like to add anything?</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const checked = value[item.key];
          return (
            <label
              key={item.key}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                checked ? "border-[#34597E] bg-[#34597E]/10" : "border-slate-200 bg-white/90"
              }`}
            >
              <div>
                <p className="text-lg font-medium text-slate-700">{item.label}</p>
                {item.price ? <p className="text-sm text-[#34597E]">{item.price}</p> : null}
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange({ ...value, [item.key]: e.target.checked })}
                className="h-5 w-5 accent-[#34597E]"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
