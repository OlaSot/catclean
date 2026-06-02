"use client";

import type { HomeResetPropertyType } from "../booking-wizard.types";

type Props = {
  value: HomeResetPropertyType | null;
  onChange: (next: HomeResetPropertyType) => void;
  error?: string;
};

export function StepPropertyType({ value, onChange, error }: Props) {
  const options: Array<{ id: HomeResetPropertyType; title: string }> = [
    { id: "apartment", title: "Apartment" },
    { id: "house", title: "House" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">
        What type of home should we clean?
      </h2>
      <p className="text-slate-500">This helps us estimate access, time and equipment needs.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-3xl border px-5 py-6 text-left text-xl font-semibold transition ${
                selected
                  ? "border-[#34597E] bg-[#34597E]/10 text-[#34597E]"
                  : "border-slate-200 bg-white/90 text-slate-700 hover:border-[#8baecc]"
              }`}
            >
              {option.title}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
