"use client";

import { WINDOW_ACCESS_OPTIONS } from "../window-cleaning.data";
import type { WindowAccessLevel, WindowCleaningDetails } from "../window-cleaning.types";

type Props = {
  value: WindowCleaningDetails;
  onChange: (next: WindowCleaningDetails) => void;
  errors?: Partial<Record<"insideOnly" | "outsideRequired" | "access", string>>;
};

function YesNoQuestion({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: boolean | null;
  onChange: (next: boolean) => void;
  error?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-base font-semibold text-slate-800 sm:text-lg">{label}</p>
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ].map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-6 py-2.5 text-sm font-semibold transition ${
                selected
                  ? "border-[#34597E] bg-[#34597E] text-white shadow-[0_6px_16px_rgba(52,89,126,0.22)]"
                  : "border-slate-300 bg-white text-slate-700 hover:border-[#34597E] hover:text-[#34597E]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export function StepWindowDetails({ value, onChange, errors }: Props) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="max-w-2xl space-y-2">
        <p className="text-sm font-medium text-[#5B8DB8]">Window Cleaning</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-[2rem]">
          Window details
        </h1>
        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
          Tell us how we should clean your windows so we can plan the right equipment and time.
        </p>
      </header>

      <div className="space-y-8 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6">
        <YesNoQuestion
          label="Inside cleaning only?"
          value={value.insideOnly}
          onChange={(insideOnly) => onChange({ ...value, insideOnly })}
          error={errors?.insideOnly}
        />
        <YesNoQuestion
          label="Outside cleaning required?"
          value={value.outsideRequired}
          onChange={(outsideRequired) => onChange({ ...value, outsideRequired })}
          error={errors?.outsideRequired}
        />

        <div className="space-y-3 border-t border-slate-200/80 pt-6">
          <p className="text-base font-semibold text-slate-800 sm:text-lg">
            How accessible are the windows?
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {WINDOW_ACCESS_OPTIONS.map((option) => {
              const selected = value.access === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChange({ ...value, access: option.id as WindowAccessLevel })}
                  className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                    selected
                      ? "border-[#34597E] bg-[#34597E]/10 text-[#34597E] shadow-[0_0_0_1px_#34597E]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#b8cfe0]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {errors?.access ? <p className="text-sm text-rose-600">{errors.access}</p> : null}
        </div>
      </div>
    </div>
  );
}
