import { UPHOLSTERY_CATEGORIES } from "./upholstery-wizard.data";
import type { UpholsteryItem, UpholsteryItemId } from "./upholstery-wizard.types";

export function getUpholsteryItemById(id: UpholsteryItemId | null): UpholsteryItem | null {
  if (!id) return null;

  for (const category of UPHOLSTERY_CATEGORIES) {
    const item = category.items.find((entry) => entry.id === id);
    if (item) return item;
  }

  return null;
}

export function formatUpholsteryPrice(amount: number): string {
  return `€${amount}`;
}
