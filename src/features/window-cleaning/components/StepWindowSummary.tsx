"use client";

import { WINDOW_ACCESS_OPTIONS, WINDOW_EXTRA_ITEMS } from "../window-cleaning.data";
import type { WindowCleaningWizardState } from "../window-cleaning.types";
import {
  formatWindowDuration,
  formatWindowPrice,
  getSelectedWindowItems,
} from "../window-cleaning.utils";

type Props = {
  state: WindowCleaningWizardState;
  estimatePrice: number;
  estimateDurationMinutes: number;
};

export function StepWindowSummary({ state, estimatePrice, estimateDurationMinutes }: Props) {
  const selectedItems = getSelectedWindowItems(state.quantities);
  const selectedExtras = WINDOW_EXTRA_ITEMS.filter((extra) => state.extras[extra.id]);
  const accessLabel =
    WINDOW_ACCESS_OPTIONS.find((option) => option.id === state.details.access)?.label ?? "—";

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="max-w-2xl space-y-2">
        <p className="text-sm font-medium text-[#5B8DB8]">Window Cleaning</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-[2rem]">Summary</h1>
        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
          Review your window cleaning request before confirming.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6">
        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="md:col-span-2">
            <dt className="text-slate-500">Selected items</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {selectedItems.length > 0
                ? selectedItems.map(({ item, quantity }) => `${item.title} × ${quantity}`).join(", ")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Inside only</dt>
            <dd className="font-medium text-slate-800">
              {state.details.insideOnly == null ? "—" : state.details.insideOnly ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Outside required</dt>
            <dd className="font-medium text-slate-800">
              {state.details.outsideRequired == null
                ? "—"
                : state.details.outsideRequired
                  ? "Yes"
                  : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Access</dt>
            <dd className="font-medium text-slate-800">{accessLabel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Extras</dt>
            <dd className="font-medium text-slate-800">
              {selectedExtras.length > 0
                ? selectedExtras.map((extra) => extra.label).join(", ")
                : "None"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Address</dt>
            <dd className="font-medium text-slate-800">
              {state.address.street} {state.address.houseNumber}, {state.address.city}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Date &amp; time</dt>
            <dd className="font-medium text-slate-800">
              {state.schedule.date || "—"} {state.schedule.time}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Contact</dt>
            <dd className="font-medium text-slate-800">
              {state.contact.name} ({state.contact.phone})
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Estimated price</dt>
            <dd className="text-xl font-semibold text-[#34597E]">{formatWindowPrice(estimatePrice)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Estimated duration</dt>
            <dd className="text-xl font-semibold text-[#34597E]">
              {formatWindowDuration(estimateDurationMinutes)}
            </dd>
          </div>
        </dl>

        <p className="mt-6 rounded-2xl border border-[#34597E]/20 bg-[#eef5fb] px-4 py-3 text-sm text-slate-600">
          Online booking submission is coming soon. Your selections are saved on this page for review
          only.
        </p>
      </div>
    </div>
  );
}
