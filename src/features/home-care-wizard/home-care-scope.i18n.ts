import type { PublicTranslateFn } from "@/i18n/public/public-i18n.types";

const INCLUDED_SECTIONS = [
  { key: "kitchen", itemCount: 5 },
  { key: "bathroom", itemCount: 5 },
  { key: "living", itemCount: 4 },
  { key: "bedrooms", itemCount: 4 },
  { key: "entire", itemCount: 3 },
] as const;

export function getHomeCareIncludedSections(t: PublicTranslateFn) {
  return INCLUDED_SECTIONS.map(({ key, itemCount }) => ({
    title: t(`public.homeCare.scope.${key}.title`),
    items: Array.from({ length: itemCount }, (_, i) =>
      t(`public.homeCare.scope.${key}.item${i + 1}`)
    ),
  }));
}

export function getHomeCareNotIncludedItems(t: PublicTranslateFn): string[] {
  return Array.from({ length: 9 }, (_, i) => t(`public.homeCare.notIncluded.item${i + 1}`));
}
