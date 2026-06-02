"use client";

import type { HomeResetCondition } from "../booking-wizard.types";

type Props = {
  value: HomeResetCondition;
  onChange: (next: HomeResetCondition) => void;
  deepPriceHint: string | null;
};

const OPTIONS: Array<{ id: HomeResetCondition; title: string; subtitle: string }> = [
  { id: "light", title: "Light refresh", subtitle: "Already tidy, needs a fresh clean" },
  { id: "standard", title: "Standard reset", subtitle: "Normal weekly/monthly cleaning" },
  { id: "deep", title: "Deep reset", subtitle: "Dust, buildup, neglected areas" },
];

export function StepCondition({ value, onChange, deepPriceHint }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">
        How much reset does your home need?
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {OPTIONS.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-3xl border p-5 text-left transition ${
                selected
                  ? "border-[#34597E] bg-[#34597E]/10"
                  : "border-slate-200 bg-white/90 hover:border-[#8baecc]"
              }`}
            >
              <p className="text-xl font-semibold text-slate-700">{item.title}</p>
              <p className="mt-1 text-slate-500">{item.subtitle}</p>
            </button>
          );
        })}
      </div>
      {deepPriceHint ? <p className="text-sm text-[#34597E]">{deepPriceHint}</p> : null}
    </div>
  );
}
