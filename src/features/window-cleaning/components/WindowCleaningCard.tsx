"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { WIZARD_CARD_IMAGE_CLASS, WIZARD_CARD_IMAGE_WRAPPER_CLASS } from "@/components/booking/wizard-card-styles";
import { WINDOW_CLEANING_PLACEHOLDER_IMAGE } from "../window-cleaning.data";
import type { WindowItem } from "../window-cleaning.types";
import { WindowSizeFrameIllustration } from "./WindowSizeFrameIllustration";

type Props = {
  item: WindowItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

export function WindowCleaningCard({ item, quantity, onQuantityChange }: Props) {
  const selected = quantity > 0;
  const preferredSrc = item.imageSrc ?? WINDOW_CLEANING_PLACEHOLDER_IMAGE;
  const [imageSrc, setImageSrc] = useState(preferredSrc);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_8px_22px_rgba(52,89,126,0.10)] ${
        selected
          ? "border-[#34597E] shadow-[0_0_0_1px_#34597E,0_6px_20px_rgba(52,89,126,0.14)] ring-2 ring-[#34597E]/15"
          : "border-slate-200/90 hover:border-[#b8cfe0]"
      }`}
    >
      <div className={WIZARD_CARD_IMAGE_WRAPPER_CLASS}>
        <Image
          src={imageSrc}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className={WIZARD_CARD_IMAGE_CLASS}
          onError={() => setImageSrc(WINDOW_CLEANING_PLACEHOLDER_IMAGE)}
        />

        {item.sizeBadge ? (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-white/95 px-1.5 text-xs font-bold text-[#34597E] shadow-sm backdrop-blur-sm">
            {item.sizeBadge}
          </span>
        ) : null}

        {selected ? (
          <span className="absolute top-2.5 right-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#34597E] text-white shadow-[0_3px_10px_rgba(52,89,126,0.3)]">
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </span>
        ) : null}

        {item.sizeFrame ? (
          <div className="absolute bottom-2 left-2 z-10 scale-90 origin-bottom-left sm:scale-100">
            <WindowSizeFrameIllustration size={item.sizeFrame} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3.5 py-3 sm:px-4 sm:py-3.5">
        <h3 className="text-sm font-semibold leading-snug text-slate-800 sm:text-[15px]">{item.title}</h3>
        <p className="line-clamp-2 text-xs leading-snug text-slate-500 sm:text-sm">{item.subtitle}</p>
        {item.sizeDescription ? (
          <p className="text-xs font-medium text-[#5B8DB8]">{item.sizeDescription}</p>
        ) : null}
        <p className="mt-0.5 text-sm font-semibold text-[#34597E]">from €{item.priceFrom}</p>

        <div
          className="mt-2 flex items-center justify-center gap-3 border-t border-slate-200/70 pt-2.5"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Decrease ${item.title} quantity`}
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            disabled={quantity === 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-[#34597E] hover:text-[#34597E] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span
            className={`min-w-[2ch] text-center text-base font-semibold tabular-nums ${
              selected ? "text-[#34597E]" : "text-slate-800"
            }`}
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label={`Increase ${item.title} quantity`}
            onClick={() => onQuantityChange(quantity + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#34597E] text-white shadow-[0_3px_10px_rgba(52,89,126,0.28)] transition hover:bg-[#2d4d6f]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
