"use client";

import { WINDOW_EXTRA_ITEMS } from "../window-cleaning.data";
import type { WindowCleaningWizardState } from "../window-cleaning.types";
import {
  formatWindowDurationRange,
  formatWindowPrice,
  getSelectedByKind,
  getUnitPrice,
} from "../window-cleaning.utils";

type Props = {
  state: WindowCleaningWizardState;
  estimatePrice: number;
  estimateDurationMinutes: number;
  className?: string;
};

export function BookingSummarySidebar({
  state,
  estimatePrice,
  estimateDurationMinutes,
  className = "",
}: Props) {
  const windowEntries = getSelectedByKind(state.quantities, "window");
  const doorEntries = getSelectedByKind(state.quantities, "door");
  const selectedExtras = WINDOW_EXTRA_ITEMS.filter((extra) => state.extras[extra.id]);
  const hasSelection = windowEntries.length > 0 || doorEntries.length > 0;

  return (
    <aside
      className={`rounded-3xl border border-slate-200/90 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:p-5 ${className}`.trim()}
    >
      <h2 className="text-base font-semibold text-slate-800 sm:text-lg">Your booking</h2>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">Live estimate based on your selections</p>

      <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4">
        <SummaryGroup title="Windows" entries={windowEntries} state={state} />
        <SummaryGroup title="Glass doors" entries={doorEntries} state={state} />

        {!hasSelection && selectedExtras.length === 0 ? (
          <p className="text-sm text-slate-400">No items selected yet</p>
        ) : null}

        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Extras</p>
          {selectedExtras.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {selectedExtras.map((extra) => (
                <li key={extra.id} className="text-sm font-medium text-slate-700">
                  {extra.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-400">None</p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">Estimated duration</span>
          <span className="text-sm font-semibold text-[#34597E]">
            {formatWindowDurationRange(estimateDurationMinutes)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">Estimated price</span>
          <span className="text-lg font-semibold text-[#34597E]">{formatWindowPrice(estimatePrice)}</span>
        </div>
        <p className="text-xs text-slate-400">Final price may vary after details step.</p>
      </div>
    </aside>
  );
}

function SummaryGroup({
  title,
  entries,
  state,
}: {
  title: string;
  entries: Array<{ item: import("../window-cleaning.types").WindowItem; quantity: number }>;
  state: WindowCleaningWizardState;
}) {
  if (entries.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {entries.map(({ item, quantity }) => (
          <li key={item.id} className="flex items-start justify-between gap-2 text-sm">
            <span className="font-medium text-slate-700">
              {item.title}
              <span className="font-normal text-slate-500"> × {quantity}</span>
            </span>
            <span className="shrink-0 text-slate-600">
              {formatWindowPrice(getUnitPrice(item, state.details) * quantity)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
