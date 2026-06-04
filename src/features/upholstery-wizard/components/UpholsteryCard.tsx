"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { WIZARD_CARD_IMAGE_CLASS, WIZARD_CARD_IMAGE_WRAPPER_CLASS } from "@/components/booking/wizard-card-styles";
import { UPHOLSTERY_PLACEHOLDER_IMAGE } from "../upholstery-wizard.data";
import type { UpholsteryItem } from "../upholstery-wizard.types";

type Props = {
  item: UpholsteryItem;
  selected: boolean;
  onSelect: (id: UpholsteryItem["id"]) => void;
};

export function UpholsteryCard({ item, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-pressed={selected}
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_8px_22px_rgba(52,89,126,0.10)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34597E] ${
        selected
          ? "border-[#34597E] shadow-[0_0_0_1px_#34597E,0_6px_20px_rgba(52,89,126,0.14)] ring-2 ring-[#34597E]/15"
          : "border-slate-200/90 hover:border-[#b8cfe0]"
      }`}
    >
      {selected ? (
        <span className="absolute top-2.5 right-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#34597E] text-white shadow-[0_3px_10px_rgba(52,89,126,0.3)]">
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}

      <div className={WIZARD_CARD_IMAGE_WRAPPER_CLASS}>
        <Image
          src={item.image ?? UPHOLSTERY_PLACEHOLDER_IMAGE}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className={WIZARD_CARD_IMAGE_CLASS}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3.5 py-3 sm:px-4 sm:py-3.5">
        <h3 className="text-sm font-semibold leading-snug text-slate-800 sm:text-[15px]">{item.title}</h3>
        <p className="line-clamp-2 text-xs leading-snug text-slate-500 sm:text-sm">{item.description}</p>
        <p className="mt-0.5 text-sm font-semibold text-[#34597E]">from €{item.priceFrom}</p>
      </div>
    </button>
  );
}
