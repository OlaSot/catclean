"use client";

import { UPHOLSTERY_CATEGORIES } from "../upholstery-wizard.data";
import type { UpholsteryItemId } from "../upholstery-wizard.types";
import { UpholsteryCategory } from "./UpholsteryCategory";
import { UploadPhotoHelp } from "./UploadPhotoHelp";

type Props = {
  selectedId: UpholsteryItemId | null;
  onSelect: (id: UpholsteryItemId) => void;
  error?: string;
};

export function StepSelectItem({ selectedId, onSelect, error }: Props) {
  return (
    <div className="space-y-6 sm:space-y-7">
      <header className="max-w-2xl space-y-1.5">
        <p className="text-sm font-medium text-[#5B8DB8]">Upholstery &amp; Sofa Cleaning</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
          What needs cleaning?
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">
          Choose the item you&apos;d like us to clean. Don&apos;t worry if you&apos;re not sure – you can
          add details and photos later.
        </p>
      </header>

      <div className="rounded-2xl border border-[#d6e6f2] bg-[#eef5fb] px-3.5 py-3 sm:px-4 sm:py-3.5">
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
          <span className="font-semibold text-slate-800">Not sure which size to choose?</span> Pick the
          closest match — you can upload photos below and we&apos;ll confirm before the visit.
        </p>
      </div>

      <div className="space-y-7 sm:space-y-8">
        {UPHOLSTERY_CATEGORIES.map((category) => (
          <UpholsteryCategory
            key={category.id}
            category={category}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      <UploadPhotoHelp />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
