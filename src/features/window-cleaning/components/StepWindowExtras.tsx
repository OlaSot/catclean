"use client";

import { WINDOW_EXTRA_ITEMS } from "../window-cleaning.data";
import type { WindowCleaningExtras, WindowExtraId } from "../window-cleaning.types";

type Props = {
  value: WindowCleaningExtras;
  onChange: (next: WindowCleaningExtras) => void;
};

export function StepWindowExtras({ value, onChange }: Props) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="max-w-2xl space-y-2">
        <p className="text-sm font-medium text-[#5B8DB8]">Window Cleaning</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-[2rem]">Extras</h1>
        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
          Add optional services to your window cleaning visit.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {WINDOW_EXTRA_ITEMS.map((item) => {
          const checked = value[item.id];
          return (
            <label
              key={item.id}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition ${
                checked
                  ? "border-[#34597E] bg-[#34597E]/10 shadow-[0_0_0_1px_#34597E]"
                  : "border-slate-200/90 bg-white hover:border-[#b8cfe0]"
              }`}
            >
              <div>
                <p className="text-base font-semibold text-slate-800">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-[#34597E]">from €{item.priceFrom}</p>
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  onChange({ ...value, [item.id as WindowExtraId]: event.target.checked })
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
