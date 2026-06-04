"use client";

import type { WindowCleaningAddress } from "../window-cleaning.types";

type Props = {
  value: WindowCleaningAddress;
  onChange: (next: WindowCleaningAddress) => void;
  errors?: Partial<Record<keyof WindowCleaningAddress, string>>;
};

function Input({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#34597E]"
      />
      {error ? <p className="mt-1 text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

export function StepWindowAddress({ value, onChange, errors }: Props) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="max-w-2xl space-y-2">
        <p className="text-sm font-medium text-[#5B8DB8]">Window Cleaning</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-[2rem]">Address</h1>
        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
          Where should our team come for the window cleaning?
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:grid-cols-2 sm:p-6">
        <Input
          label="Street"
          value={value.street}
          onChange={(street) => onChange({ ...value, street })}
          error={errors?.street}
        />
        <Input
          label="House number"
          value={value.houseNumber}
          onChange={(houseNumber) => onChange({ ...value, houseNumber })}
          error={errors?.houseNumber}
        />
        <Input
          label="Apartment"
          value={value.apartment}
          onChange={(apartment) => onChange({ ...value, apartment })}
        />
        <Input label="ZIP" value={value.zip} onChange={(zip) => onChange({ ...value, zip })} error={errors?.zip} />
        <Input label="City" value={value.city} onChange={(city) => onChange({ ...value, city })} error={errors?.city} />
        <Input label="Floor" value={value.floor} onChange={(floor) => onChange({ ...value, floor })} />
      </div>
    </div>
  );
}
