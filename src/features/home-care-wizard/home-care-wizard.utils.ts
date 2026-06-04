import type { OrderServiceType } from "@/lib/constants/orders";
import { tryCalculateOrderPrice } from "@/lib/pricing/calculate-order-price";
import {
  BOOKING_PRODUCT_HOME_CARE,
  ENHANCEMENT_OPTIONS,
  FREQUENCY_OPTIONS,
  PETS_OPTIONS,
} from "./home-care-wizard.constants";
import type {
  HomeCareEnhancement,
  HomeCareEstimate,
  HomeCarePetsOption,
  HomeCareWizardState,
} from "./home-care-wizard.types";

export const HOME_CARE_ORDER_SERVICE_TYPE: OrderServiceType = "regular_cleaning";

export function formatHomeCarePrice(price: number | null): string {
  if (price == null) return "—";
  return `€${price.toFixed(0)}`;
}

export function formatHomeCareDuration(minutes: number | null): string {
  if (minutes == null) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function frequencyLabel(frequency: HomeCareWizardState["frequency"]): string {
  return FREQUENCY_OPTIONS.find((item) => item.id === frequency)?.label ?? frequency;
}

export function propertyTypeLabel(type: HomeCareWizardState["propertyType"]): string {
  if (type === "apartment") return "Apartment";
  if (type === "house") return "House";
  return "—";
}

export function petsLabel(option: HomeCarePetsOption): string {
  return PETS_OPTIONS.find((item) => item.id === option)?.label ?? option;
}

export function formatSizeLabel(m2: number): string {
  if (m2 >= 200) return "200m²+";
  return `${m2}m²`;
}

export function getSelectedEnhancements(state: HomeCareWizardState): HomeCareEnhancement[] {
  return ENHANCEMENT_OPTIONS.filter((item) => state.enhancements[item.id]).map(
    (item) => item.id
  );
}

export function enhancementLabels(state: HomeCareWizardState): string {
  return getSelectedEnhancements(state)
    .map((id) => ENHANCEMENT_OPTIONS.find((item) => item.id === id)?.title)
    .filter(Boolean)
    .join(", ");
}

export function buildServiceDetails(state: HomeCareWizardState): Record<string, unknown> | null {
  const propertySizeM2 = Number(state.propertySizeM2);
  if (!Number.isFinite(propertySizeM2) || propertySizeM2 <= 0) return null;

  return {
    propertySizeM2,
    cleaningIntensity: "standard",
    cleaningFrequency: state.frequency,
    propertyType: state.propertyType,
    petsOption: state.petsOption,
    petType: state.petsOption === "no_pets" ? null : state.petsOption,
    ovenCleaning: state.enhancements.oven_refresh,
    fridgeCleaning: state.enhancements.fridge_refresh,
    insideCabinets: state.enhancements.inside_cabinets,
    balconyIncluded: state.enhancements.balcony_cleaning,
    windowsInside: state.enhancements.window_cleaning,
    hasPets: false,
  };
}

export function calculateHomeCareEstimate(state: HomeCareWizardState): HomeCareEstimate {
  const details = buildServiceDetails(state);
  if (!details) return { price: null, durationMinutes: null };

  const result = tryCalculateOrderPrice(HOME_CARE_ORDER_SERVICE_TYPE, details);
  if (!result) return { price: null, durationMinutes: null };

  return {
    price: result.estimatedPrice,
    durationMinutes: result.estimatedDurationMinutes,
  };
}

export function serializeHomeCareComment(state: HomeCareWizardState): string {
  const lines: string[] = [
    "Home Care booking",
    `Booking product: ${BOOKING_PRODUCT_HOME_CARE}`,
    `Frequency: ${frequencyLabel(state.frequency)}`,
    `Property type: ${propertyTypeLabel(state.propertyType)}`,
    `Size: ${formatSizeLabel(state.propertySizeM2)}`,
    `Pets: ${petsLabel(state.petsOption)}`,
  ];

  const extras = enhancementLabels(state);
  if (extras) lines.push(`Extras: ${extras}`);

  if (state.address.accessNotes.trim()) {
    lines.push(`Access notes: ${state.address.accessNotes.trim()}`);
  }
  if (state.contact.notes.trim()) {
    lines.push(`Additional notes: ${state.contact.notes.trim()}`);
  }

  return lines.join("\n");
}
