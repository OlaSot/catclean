"use client";

import type { BookingWizardState } from "../booking-wizard.types";

type Address = BookingWizardState["address"];

type Props = {
  value: Address;
  onChange: (next: Address) => void;
  errors?: Partial<Record<keyof Address, string>>;
};

function Input(props: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{props.label}</span>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
      />
      {props.error ? <p className="mt-1 text-sm text-rose-600">{props.error}</p> : null}
    </label>
  );
}

export function StepAddress({ value, onChange, errors }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Address</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Street" value={value.street} onChange={(street) => onChange({ ...value, street })} error={errors?.street} />
        <Input
          label="House number"
          value={value.houseNumber}
          onChange={(houseNumber) => onChange({ ...value, houseNumber })}
          error={errors?.houseNumber}
        />
        <Input label="Apartment" value={value.apartment} onChange={(apartment) => onChange({ ...value, apartment })} />
        <Input label="ZIP" value={value.zip} onChange={(zip) => onChange({ ...value, zip })} error={errors?.zip} />
        <Input label="City" value={value.city} onChange={(city) => onChange({ ...value, city })} error={errors?.city} />
        <Input label="Floor" value={value.floor} onChange={(floor) => onChange({ ...value, floor })} />
      </div>
    </div>
  );
}
