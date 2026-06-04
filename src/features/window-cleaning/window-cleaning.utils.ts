import {
  ALL_WINDOW_CLEANING_ITEMS,
  DOOR_ITEMS,
  WINDOW_EXTRA_ITEMS,
  WINDOW_ITEMS,
} from "./window-cleaning.data";
import type {
  WindowCleaningEstimate,
  WindowCleaningWizardState,
  WindowItem,
  WindowItemId,
} from "./window-cleaning.types";

const ITEM_BY_ID = new Map<WindowItemId, WindowItem>(
  ALL_WINDOW_CLEANING_ITEMS.map((item) => [item.id, item])
);

export function getWindowItem(id: WindowItemId): WindowItem | undefined {
  return ITEM_BY_ID.get(id);
}

export function getUnitPrice(
  item: WindowItem,
  details: WindowCleaningWizardState["details"]
): number {
  let unitPrice = item.priceFrom;
  if (details.outsideRequired === true) unitPrice *= 1.35;
  if (details.access === "ladder") unitPrice += 3;
  if (details.access === "difficult") unitPrice += 6;
  return Math.round(unitPrice * 100) / 100;
}

export function getSelectedWindowItems(
  quantities: WindowCleaningWizardState["quantities"]
): Array<{ item: WindowItem; quantity: number }> {
  return ALL_WINDOW_CLEANING_ITEMS.map((item) => ({
    item,
    quantity: quantities[item.id] ?? 0,
  })).filter((entry) => entry.quantity > 0);
}

export function getSelectedByKind(
  quantities: WindowCleaningWizardState["quantities"],
  kind: WindowItem["kind"]
): Array<{ item: WindowItem; quantity: number }> {
  return getSelectedWindowItems(quantities).filter((entry) => entry.item.kind === kind);
}

export function calculateWindowCleaningEstimate(
  state: WindowCleaningWizardState
): WindowCleaningEstimate {
  let price = 0;
  let durationMinutes = 0;

  for (const { item, quantity } of getSelectedWindowItems(state.quantities)) {
    price += getUnitPrice(item, state.details) * quantity;
    durationMinutes += item.durationMinutes * quantity;
  }

  for (const extra of WINDOW_EXTRA_ITEMS) {
    if (!state.extras[extra.id]) continue;
    price += extra.priceFrom;
    durationMinutes += extra.durationMinutes;
  }

  return {
    price: Math.round(price * 100) / 100,
    durationMinutes,
  };
}

export function formatWindowPrice(price: number | null): string {
  if (price == null) return "—";
  return `€${price.toFixed(2)}`;
}

export function formatWindowDuration(minutes: number | null): string {
  if (minutes == null || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatWindowDurationRange(minutes: number): string {
  if (minutes <= 0) return "—";
  const minHours = Math.max(0.5, (minutes * 0.85) / 60);
  const maxHours = (minutes * 1.15) / 60;
  const fmt = (value: number) => (Number.isInteger(value) ? `${value}` : value.toFixed(1));
  return `${fmt(minHours)} – ${fmt(maxHours)} h`;
}

export function createEmptyQuantities(): WindowCleaningWizardState["quantities"] {
  return ALL_WINDOW_CLEANING_ITEMS.reduce(
    (acc, item) => {
      acc[item.id] = 0;
      return acc;
    },
    {} as WindowCleaningWizardState["quantities"]
  );
}

export { WINDOW_ITEMS, DOOR_ITEMS };
