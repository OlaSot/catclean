"use client";

import { Armchair, BedDouble, Leaf, Sofa } from "lucide-react";
import type {
  UpholsteryCategoryIcon,
  UpholsteryCategorySection,
  UpholsteryItemId,
} from "../upholstery-wizard.types";
import { UpholsteryCard } from "./UpholsteryCard";

const CATEGORY_ICONS: Record<UpholsteryCategoryIcon, typeof Sofa> = {
  sofa: Sofa,
  bed: BedDouble,
  armchair: Armchair,
};

type Props = {
  category: UpholsteryCategorySection;
  selectedId: UpholsteryItemId | null;
  onSelect: (id: UpholsteryItemId) => void;
};

export function UpholsteryCategory({ category, selectedId, onSelect }: Props) {
  const Icon = CATEGORY_ICONS[category.icon];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#34597E]/10 text-[#34597E]">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{category.title}</h2>
        </div>

        {category.showEcoBadge ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#d4e4f0] bg-[#f5fafd] px-2.5 py-1 text-[11px] font-medium text-[#456889] sm:text-xs">
            <Leaf className="h-3 w-3 text-[#5B8DB8]" aria-hidden />
            Eco-friendly products included
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
        {category.items.map((item) => (
          <UpholsteryCard
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
