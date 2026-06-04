"use client";

import type { UpholsteryItemId } from "../upholstery-wizard.types";
import { formatUpholsteryPrice, getUpholsteryItemById } from "../upholstery-wizard.utils";

type Props = {
  selectedId: UpholsteryItemId | null;
  className?: string;
};

export function UpholsteryBookingSidebar({ selectedId, className = "" }: Props) {
  const selectedItem = getUpholsteryItemById(selectedId);

  return (
    <aside
      className={`rounded-3xl border border-slate-200/90 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:p-5 ${className}`.trim()}
    >
      <h2 className="text-base font-semibold text-slate-800 sm:text-lg">Your booking</h2>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">Selected item and starting price</p>

      <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Item</p>
          {selectedItem ? (
            <p className="mt-1.5 text-sm font-medium text-slate-700">{selectedItem.title}</p>
          ) : (
            <p className="mt-1.5 text-sm text-slate-400">No item selected yet</p>
          )}
        </div>

        {selectedItem ? (
          <p className="text-xs leading-relaxed text-slate-500">{selectedItem.description}</p>
        ) : null}
      </div>

      <div className="mt-4 border-t border-slate-200/80 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">From</span>
          <span className="text-lg font-semibold text-[#34597E]">
            {selectedItem ? formatUpholsteryPrice(selectedItem.priceFrom) : "—"}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Final price may vary after details step.</p>
      </div>
    </aside>
  );
}
