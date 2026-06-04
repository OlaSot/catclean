"use client";

import { DoorOpen, Square } from "lucide-react";
import type { WindowCleaningQuantities, WindowItem, WindowItemId } from "../window-cleaning.types";
import { WindowCleaningCard } from "./WindowCleaningCard";

type Props = {
  title: string;
  icon: "window" | "door";
  items: WindowItem[];
  quantities: WindowCleaningQuantities;
  onQuantityChange: (id: WindowItemId, quantity: number) => void;
};

const ICONS = {
  window: Square,
  door: DoorOpen,
};

export function WindowCleaningCategory({
  title,
  icon,
  items,
  quantities,
  onQuantityChange,
}: Props) {
  const Icon = ICONS[icon];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#34597E]/10 text-[#34597E]">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{title}</h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <WindowCleaningCard
            key={item.id}
            item={item}
            quantity={quantities[item.id] ?? 0}
            onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
          />
        ))}
      </div>
    </section>
  );
}
