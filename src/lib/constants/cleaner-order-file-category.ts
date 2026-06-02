export const CLEANER_ORDER_FILE_CATEGORIES = [
  { value: "before_photo", label: "Before photo" },
  { value: "after_photo", label: "After photo" },
  { value: "damage_photo", label: "Damage photo" },
  { value: "other", label: "Other" },
] as const;

export type CleanerOrderFileCategory =
  (typeof CLEANER_ORDER_FILE_CATEGORIES)[number]["value"];

const CATEGORY_SET = new Set<string>(
  CLEANER_ORDER_FILE_CATEGORIES.map((c) => c.value)
);

export function isCleanerOrderFileCategory(
  value: string
): value is CleanerOrderFileCategory {
  return CATEGORY_SET.has(value);
}
