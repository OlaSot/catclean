"use client";

import { formatDuration, formatPrice } from "../booking-wizard.utils";
import type { BookingWizardState } from "../booking-wizard.types";

type Props = {
  state: BookingWizardState;
  estimatePrice: number | null;
  estimateDurationMinutes: number | null;
  isHomeResetFlow: boolean;
};

function serviceLabel(service: BookingWizardState["service"]): string {
  if (service === "home_reset") return "Home Reset";
  if (service === "move_out") return "Move Out Cleaning";
  if (service === "regular_cleaning") return "Regular Cleaning";
  if (service === "dry_cleaning") return "Dry Cleaning";
  if (service === "office_cleaning") return "Office Cleaning";
  if (service === "window_cleaning") return "Window Cleaning";
  return "—";
}

export function StepSummary({ state, estimatePrice, estimateDurationMinutes, isHomeResetFlow }: Props) {
  const extras = Object.entries(state.extras)
    .filter(([, value]) => value)
    .map(([k]) => k)
    .join(", ");
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-700">Summary</h2>
      {!isHomeResetFlow ? (
        <p className="rounded-2xl border border-[#34597E]/20 bg-[#34597E]/10 px-4 py-3 text-sm text-slate-700">
          Move Out and Regular Cleaning currently use a simplified flow. Home Reset has the full guided questionnaire.
        </p>
      ) : null}
      <div className="rounded-3xl border border-white/70 bg-white/75 p-5 backdrop-blur-md">
        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div><dt className="text-slate-500">Service</dt><dd className="font-medium text-slate-700">{serviceLabel(state.service)}</dd></div>
          <div><dt className="text-slate-500">Property type</dt><dd className="font-medium text-slate-700">{state.propertyType ?? "—"}</dd></div>
          <div><dt className="text-slate-500">Size</dt><dd className="font-medium text-slate-700">{state.propertySizeM2} m²</dd></div>
          <div><dt className="text-slate-500">Rooms / bathrooms</dt><dd className="font-medium text-slate-700">{state.roomsCount} / {state.bathroomsCount}</dd></div>
          <div><dt className="text-slate-500">Condition</dt><dd className="font-medium text-slate-700">{state.condition}</dd></div>
          <div><dt className="text-slate-500">Pets</dt><dd className="font-medium text-slate-700">{state.petsOption}</dd></div>
          <div><dt className="text-slate-500">Extras</dt><dd className="font-medium text-slate-700">{extras || "None"}</dd></div>
          <div><dt className="text-slate-500">Supplies / equipment</dt><dd className="font-medium text-slate-700">{state.suppliesChoice}, {state.vacuumChoice}</dd></div>
          <div><dt className="text-slate-500">Address</dt><dd className="font-medium text-slate-700">{state.address.street} {state.address.houseNumber}, {state.address.city}</dd></div>
          <div><dt className="text-slate-500">Date & time</dt><dd className="font-medium text-slate-700">{state.schedule.date} {state.schedule.time}</dd></div>
          <div><dt className="text-slate-500">Contact</dt><dd className="font-medium text-slate-700">{state.contact.name} ({state.contact.phone})</dd></div>
          <div><dt className="text-slate-500">Estimated price</dt><dd className="text-xl font-semibold text-[#34597E]">{formatPrice(estimatePrice)}</dd></div>
          <div><dt className="text-slate-500">Estimated duration</dt><dd className="text-xl font-semibold text-[#34597E]">{formatDuration(estimateDurationMinutes)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
