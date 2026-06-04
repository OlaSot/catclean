"use client";

import { DOOR_ITEMS, WINDOW_CLEANING_SERVICE, WINDOW_ITEMS } from "../window-cleaning.data";
import type { WindowCleaningQuantities, WindowItemId } from "../window-cleaning.types";
import { UploadPhotoHelp } from "./UploadPhotoHelp";
import { WindowCleaningCategory } from "./WindowCleaningCategory";

type Props = {
  quantities: WindowCleaningQuantities;
  onQuantityChange: (id: WindowItemId, quantity: number) => void;
  error?: string;
};

export function StepSelectItems({ quantities, onQuantityChange, error }: Props) {
  return (
    <div className="space-y-6 sm:space-y-7">
      <header className="max-w-2xl space-y-1.5">
        <p className="text-sm font-medium text-[#5B8DB8]">{WINDOW_CLEANING_SERVICE.name}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
          {WINDOW_CLEANING_SERVICE.title}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">{WINDOW_CLEANING_SERVICE.subtitle}</p>
      </header>

      <div className="rounded-2xl border border-[#d6e6f2] bg-[#eef5fb] px-3.5 py-3 sm:px-4 sm:py-3.5">
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
          <span className="font-semibold text-slate-800">{WINDOW_CLEANING_SERVICE.infoTitle}</span>{" "}
          {WINDOW_CLEANING_SERVICE.infoText}
        </p>
      </div>

      <div className="space-y-7 sm:space-y-8">
        <WindowCleaningCategory
          title="Windows"
          icon="window"
          items={WINDOW_ITEMS}
          quantities={quantities}
          onQuantityChange={onQuantityChange}
        />

        <WindowCleaningCategory
          title="Glass doors"
          icon="door"
          items={DOOR_ITEMS}
          quantities={quantities}
          onQuantityChange={onQuantityChange}
        />
      </div>

      <UploadPhotoHelp />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
