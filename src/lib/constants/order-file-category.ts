export const ORDER_FILE_CATEGORIES = [
  { value: "before_photo", label: "Before photo" },
  { value: "after_photo", label: "After photo" },
  { value: "damage_photo", label: "Damage photo" },
  { value: "document", label: "Document" },
  { value: "other", label: "Other" },
] as const;

export type OrderFileCategory = (typeof ORDER_FILE_CATEGORIES)[number]["value"];

const CATEGORY_SET = new Set<string>(ORDER_FILE_CATEGORIES.map((c) => c.value));

export function isOrderFileCategory(value: string): value is OrderFileCategory {
  return CATEGORY_SET.has(value);
}

export function getOrderFileCategoryLabel(category: string): string {
  const match = ORDER_FILE_CATEGORIES.find((item) => item.value === category);
  return match?.label ?? category.replace(/_/g, " ");
}
