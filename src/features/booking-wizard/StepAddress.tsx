"use client";

import type { BookingAddress } from "./types";

type StepAddressProps = {
  value: BookingAddress;
  onChange: (value: BookingAddress) => void;
  errors?: Partial<Record<keyof BookingAddress, string>>;
};

function InputField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{props.label}</span>
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
      />
      {props.error ? <p className="mt-1 text-sm text-rose-600">{props.error}</p> : null}
    </label>
  );
}

export function StepAddress({ value, onChange, errors }: StepAddressProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Address</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField
          label="Street"
          value={value.street}
          onChange={(street) => onChange({ ...value, street })}
          error={errors?.street}
        />
        <InputField
          label="House number"
          value={value.houseNumber}
          onChange={(houseNumber) => onChange({ ...value, houseNumber })}
          error={errors?.houseNumber}
        />
        <InputField
          label="Apartment"
          value={value.apartment}
          onChange={(apartment) => onChange({ ...value, apartment })}
        />
        <InputField
          label="ZIP"
          value={value.zip}
          onChange={(zip) => onChange({ ...value, zip })}
          error={errors?.zip}
        />
        <InputField
          label="City"
          value={value.city}
          onChange={(city) => onChange({ ...value, city })}
          error={errors?.city}
        />
      </div>
    </div>
  );
}
