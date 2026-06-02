"use client";

import { formatDuration, formatPrice } from "./booking-wizard.utils";

type StepSizeProps = {
  value: string;
  onChange: (value: string) => void;
  estimatePrice: number | null;
  estimateDurationMinutes: number | null;
  error?: string;
};

export function StepSize({
  value,
  onChange,
  estimatePrice,
  estimateDurationMinutes,
  error,
}: StepSizeProps) {
  const currentSize = Number(value);
  const sliderValue = Number.isFinite(currentSize) && currentSize > 0 ? currentSize : 50;

  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">How large is your home?</h2>
      <div className="rounded-3xl border border-white/70 bg-white/80 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Property size (m²)</span>
          <span className="rounded-full bg-[#34597E]/10 px-3 py-1 text-lg font-semibold text-[#34597E]">
            {sliderValue} m²
          </span>
        </div>
        <input
          type="range"
          min={20}
          max={250}
          step={1}
          value={sliderValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#34597E]"
          aria-label="Property size in square meters"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
          <span>20 m²</span>
          <span>250 m²</span>
        </div>
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
