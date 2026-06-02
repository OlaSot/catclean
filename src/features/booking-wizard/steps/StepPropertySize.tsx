"use client";

import { formatDuration, formatPrice } from "../booking-wizard.utils";

type Props = {
  value: number;
  onChange: (next: number) => void;
  presets: number[];
  estimatePrice: number | null;
  estimateDurationMinutes: number | null;
  error?: string;
};

export function StepPropertySize({
  value,
  onChange,
  presets,
  estimatePrice,
  estimateDurationMinutes,
  error,
}: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">How large is your home?</h2>
      <div className="rounded-3xl border border-white/70 bg-white/80 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Property size (m²)</span>
          <span className="rounded-full bg-[#34597E]/10 px-3 py-1 text-lg font-semibold text-[#34597E]">
            {value} m²
          </span>
        </div>
        <input
          type="range"
          min={20}
          max={250}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#34597E]"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
          <span>20 m²</span>
          <span>250 m²</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              value === preset
                ? "border-[#34597E] bg-[#34597E]/10 text-[#34597E]"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#8baecc]"
            }`}
          >
            {preset} m²
          </button>
        ))}
        <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">Custom</span>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/70 bg-white/75 p-4">
          <p className="text-sm text-slate-500">Estimated price</p>
          <p className="mt-1 text-2xl font-semibold text-[#34597E]">{formatPrice(estimatePrice)}</p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/75 p-4">
          <p className="text-sm text-slate-500">Estimated duration</p>
          <p className="mt-1 text-2xl font-semibold text-[#34597E]">{formatDuration(estimateDurationMinutes)}</p>
        </div>
      </div>
    </div>
  );
}
