import type { OrderServiceType } from "@/lib/constants/orders";
import { getHomeResetUpgradeSurchargeEur } from "@/lib/orders/home-reset-upgrade";
import { tryCalculateOrderPrice } from "@/lib/pricing/calculate-order-price";
import {
  CUSTOMIZE_UPGRADE_OPTIONS,
  ENHANCEMENT_OPTIONS,
  ENHANCEMENTS_INCLUDED_IN_KITCHEN_DEEP_RESET,
  KITCHEN_DEEP_RESET,
  PET_HOME_UPGRADE,
} from "./home-reset-wizard.constants";
import type { HomeResetEnhancements } from "./home-reset-wizard.types";
import type {
  HomeResetEnhancement,
  HomeResetEstimate,
  HomeResetPetsOption,
  HomeResetUpgrade,
  HomeResetWizardState,
} from "./home-reset-wizard.types";

/** Home Reset always books as regular cleaning in the orders API. */
export const HOME_RESET_ORDER_SERVICE_TYPE: OrderServiceType = "regular_cleaning";

/**
 * Internal pricing field — not shown to customers.
 * Base sqm rate uses standard intensity; upgrade surcharges are applied separately.
 */
export const HOME_RESET_PRICING_INTENSITY = "standard" as const;

export function hasPetsSelected(petsOption: HomeResetPetsOption): boolean {
  return petsOption !== "no_pets";
}

export function isPetHomeUpgradeIncluded(state: HomeResetWizardState): boolean {
  return hasPetsSelected(state.petsOption);
}

export function isKitchenDeepResetSelected(state: HomeResetWizardState): boolean {
  return state.upgrade === "kitchen_upgrade";
}

export function petHomeUpgradeSummaryLabel(): string {
  return PET_HOME_UPGRADE.summaryLabel;
}

export function kitchenDeepResetSummaryLabel(): string {
  return KITCHEN_DEEP_RESET.summaryLabel;
}

export function stripKitchenIncludedEnhancements(
  enhancements: HomeResetEnhancements
): HomeResetEnhancements {
  return {
    ...enhancements,
    oven_refresh: false,
    fridge_refresh: false,
  };
}

export function getAvailableEnhancementOptions(upgrade: HomeResetUpgrade) {
  if (upgrade === "kitchen_upgrade") {
    return ENHANCEMENT_OPTIONS.filter(
      (item) => !ENHANCEMENTS_INCLUDED_IN_KITCHEN_DEEP_RESET.includes(item.id)
    );
  }
  return ENHANCEMENT_OPTIONS;
}

export function formatHomeResetPrice(price: number | null): string {
  if (price == null) return "—";
  return `€${price.toFixed(0)}`;
}

export function formatUpgradePrice(priceEur: number): string {
  if (priceEur === 0) return "Included";
  return `+€${priceEur}`;
}

export function formatHomeResetDuration(minutes: number | null): string {
  if (minutes == null) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function upgradeLabel(upgrade: HomeResetUpgrade): string {
  return CUSTOMIZE_UPGRADE_OPTIONS.find((item) => item.id === upgrade)?.title ?? upgrade;
}

export function getUpgradeSurchargeEur(upgrade: HomeResetUpgrade): number {
  return getHomeResetUpgradeSurchargeEur(upgrade);
}

export function propertyTypeLabel(type: HomeResetWizardState["propertyType"]): string {
  if (type === "apartment") return "Apartment";
  if (type === "house") return "House";
  return "—";
}

export function petsLabel(option: HomeResetWizardState["petsOption"]): string {
  if (option === "no_pets") return "No pets";
  if (option === "cat") return "Cat";
  if (option === "dog") return "Dog";
  return "Multiple pets";
}

export function getSelectedEnhancements(state: HomeResetWizardState): HomeResetEnhancement[] {
  return getAvailableEnhancementOptions(state.upgrade)
    .filter((item) => state.enhancements[item.id])
    .map((item) => item.id);
}

export function enhancementLabels(state: HomeResetWizardState): string {
  return getSelectedEnhancements(state)
    .map((id) => ENHANCEMENT_OPTIONS.find((item) => item.id === id)?.title)
    .filter(Boolean)
    .join(", ");
}

function effectiveEnhancements(state: HomeResetWizardState): HomeResetEnhancements {
  return isKitchenDeepResetSelected(state)
    ? stripKitchenIncludedEnhancements(state.enhancements)
    : state.enhancements;
}

export function buildServiceDetails(state: HomeResetWizardState): Record<string, unknown> | null {
  const propertySizeM2 = Number(state.propertySizeM2);
  if (!Number.isFinite(propertySizeM2) || propertySizeM2 <= 0) return null;

  const enhancements = effectiveEnhancements(state);

  return {
    propertySizeM2,
    cleaningIntensity: HOME_RESET_PRICING_INTENSITY,
    ovenCleaning: enhancements.oven_refresh,
    fridgeCleaning: enhancements.fridge_refresh,
    balconyIncluded: enhancements.balcony_cleaning,
    /** Pet care is scoped via Pet Home Upgrade — no separate pets pricing surcharge. */
    hasPets: false,
  };
}

export function calculateHomeResetEstimate(state: HomeResetWizardState): HomeResetEstimate {
  const details = buildServiceDetails(state);
  if (!details) return { price: null, durationMinutes: null };

  const result = tryCalculateOrderPrice(HOME_RESET_ORDER_SERVICE_TYPE, details);
  if (!result) return { price: null, durationMinutes: null };

  const upgradeSurcharge = getUpgradeSurchargeEur(state.upgrade);
  const price = Math.round((result.estimatedPrice + upgradeSurcharge) * 100) / 100;

  return {
    price,
    durationMinutes: result.estimatedDurationMinutes,
  };
}

export function serializeHomeResetComment(state: HomeResetWizardState): string {
  const lines: string[] = ["Home Reset booking"];
  lines.push(`Property type: ${propertyTypeLabel(state.propertyType)}`);
  const surcharge = getUpgradeSurchargeEur(state.upgrade);
  if (isKitchenDeepResetSelected(state)) {
    lines.push(`${KITCHEN_DEEP_RESET.summaryLabel}${surcharge > 0 ? ` (+€${surcharge})` : ""}`);
  } else {
    lines.push(
      `Selected Home Reset option: ${upgradeLabel(state.upgrade)}${surcharge > 0 ? ` (+€${surcharge})` : ""}`
    );
  }
  lines.push(`Pets: ${petsLabel(state.petsOption)}`);
  if (isPetHomeUpgradeIncluded(state)) {
    lines.push(PET_HOME_UPGRADE.summaryLabel);
  }

  const extras = enhancementLabels(state);
  if (extras) {
    lines.push(`Enhancements: ${extras}`);
  }

  if (state.specialRequest.trim()) {
    lines.push(`Special requests: ${state.specialRequest.trim()}`);
  }

  if (state.address.accessNotes.trim()) {
    lines.push(`Access notes: ${state.address.accessNotes.trim()}`);
  }
  if (state.contact.notes.trim()) {
    lines.push(`Additional notes: ${state.contact.notes.trim()}`);
  }

  return lines.join("\n");
}

export function formatSizeLabel(m2: number): string {
  if (m2 >= 150) return "150m²+";
  return `${m2}m²`;
}
