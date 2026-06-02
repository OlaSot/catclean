"use client";

import { formatDuration, formatPrice } from "./booking-wizard.utils";
import type { BookingWizardState } from "./types";

type StepSummaryProps = {
  state: BookingWizardState;
  estimatePrice: number | null;
  estimateDurationMinutes: number | null;
};

function serviceLabel(service: BookingWizardState["service"]): string {
  if (service === "home_reset") return "Home Reset";
  if (service === "move_out") return "Move Out Cleaning";
  if (service === "regular_cleaning") return "Regular Cleaning";
  return "—";
}

export function StepSummary({ state, estimatePrice, estimateDurationMinutes }: StepSummaryProps) {
  const selectedExtras = Object.entries(state.extras)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join(", ");

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Summary</h2>
      <div className="rounded-3xl border border-white/70 bg-white/75 p-5 backdrop-blur-md">
        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div><dt className="text-slate-500">Service</dt><dd className="font-medium text-slate-700">{serviceLabel(state.service)}</dd></div>
          <div><dt className="text-slate-500">Size</dt><dd className="font-medium text-slate-700">{state.propertySizeM2 || "—"} m²</dd></div>
          <div><dt className="text-slate-500">Extras</dt><dd className="font-medium text-slate-700">{selectedExtras || "None"}</dd></div>
          <div><dt className="text-slate-500">Address</dt><dd className="font-medium text-slate-700">{`${state.address.street} ${state.address.houseNumber}, ${state.address.city}`}</dd></div>
          <div><dt className="text-slate-500">Date</dt><dd className="font-medium text-slate-700">{state.schedule.date || "—"} {state.schedule.time || ""}</dd></div>
          <div><dt className="text-slate-500">Contact</dt><dd className="font-medium text-slate-700">{state.contact.name} ({state.contact.phone})</dd></div>
          <div><dt className="text-slate-500">Price</dt><dd className="text-xl font-semibold text-[#34597E]">{formatPrice(estimatePrice)}</dd></div>
          <div><dt className="text-slate-500">Duration</dt><dd className="text-xl font-semibold text-[#34597E]">{formatDuration(estimateDurationMinutes)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
