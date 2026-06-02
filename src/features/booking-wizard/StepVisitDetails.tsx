"use client";

import type { BookingVisitDetails } from "./types";

type StepVisitDetailsProps = {
  value: BookingVisitDetails;
  onChange: (value: BookingVisitDetails) => void;
};

function TextareaField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{props.label}</span>
      <textarea
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        rows={3}
        className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-[#34597E]"
      />
    </label>
  );
}

export function StepVisitDetails({ value, onChange }: StepVisitDetailsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Visit details</h2>
      <TextareaField
        label="Pets info"
        value={value.petsInfo}
        onChange={(petsInfo) => onChange({ ...value, petsInfo })}
      />
      <TextareaField
        label="Access instructions"
        value={value.accessInstructions}
        onChange={(accessInstructions) => onChange({ ...value, accessInstructions })}
      />
      <TextareaField
        label="Equipment note"
        value={value.equipmentNote}
        onChange={(equipmentNote) => onChange({ ...value, equipmentNote })}
      />
      <TextareaField
        label="Additional comment"
        value={value.additionalComment}
        onChange={(additionalComment) => onChange({ ...value, additionalComment })}
      />
    </div>
  );
}
