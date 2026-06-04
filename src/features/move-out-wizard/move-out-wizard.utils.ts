import { tryCalculateOrderPrice } from "@/lib/pricing/calculate-order-price";
import {
  BOOKING_PRODUCT_MOVE_OUT,
  conditionSuggestsPremium,
  MOVE_OUT_ORDER_SERVICE_TYPE,
  MOVE_OUT_SIZE_MIN_M2,
} from "./move-out-wizard.constants";
import type {
  ApartmentCondition,
  MoveOutEstimate,
  MoveOutPackage,
  MoveOutWizardState,
} from "./move-out-wizard.types";

export function formatMoveOutPrice(price: number | null): string {
  if (price == null) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDurationLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function formatSizeLabel(m2: number): string {
  if (m2 >= 200) return "200m²+";
  return `${m2}m²`;
}

export function buildServiceDetails(state: MoveOutWizardState): Record<string, unknown> | null {
  if (!state.package) return null;
  const propertySizeM2 = Number(state.propertySizeM2);
  if (!Number.isFinite(propertySizeM2) || propertySizeM2 < MOVE_OUT_SIZE_MIN_M2) {
    return null;
  }

  return {
    packageType: state.package,
    propertySizeM2,
    emptyApartment: state.extras.emptyApartment,
    heavyLimescale: state.extras.heavyLimescale,
    heavyDirt: state.extras.heavyDirt,
    insideCabinets: state.extras.insideCabinets,
    fridgeCleaning: state.extras.fridgeCleaning,
    ovenCleaning: state.extras.ovenCleaning,
    windowsInside: state.extras.windowsInside,
    balconyIncluded: state.extras.balconyIncluded,
  };
}

export function getMoveOutEstimate(state: MoveOutWizardState): MoveOutEstimate {
  const details = buildServiceDetails(state);
  if (!details) {
    return { price: null, durationMinutes: null, durationLabel: null };
  }

  const result = tryCalculateOrderPrice(MOVE_OUT_ORDER_SERVICE_TYPE, details);
  if (!result) {
    return { price: null, durationMinutes: null, durationLabel: null };
  }

  const durationMinutes = result.estimatedDurationMinutes;
  return {
    price: result.estimatedPrice,
    durationMinutes,
    durationLabel:
      durationMinutes != null ? formatDurationLabel(durationMinutes) : null,
  };
}

export function serializeMoveOutComment(state: MoveOutWizardState): string {
  const lines: string[] = [
    "Move Out booking",
    `Booking product: ${BOOKING_PRODUCT_MOVE_OUT}`,
    `Package: ${state.package ?? "—"}`,
    `Condition: ${state.apartmentCondition ?? "—"}`,
  ];

  const { visitNotes, contact } = state;
  if (visitNotes.accessNotes.trim()) {
    lines.push(`Access notes: ${visitNotes.accessNotes.trim()}`);
  }
  if (visitNotes.petsInfo.trim()) {
    lines.push(`Pets info: ${visitNotes.petsInfo.trim()}`);
  }
  if (visitNotes.suppliesNote.trim()) {
    lines.push(`Supplies note: ${visitNotes.suppliesNote.trim()}`);
  }
  if (visitNotes.equipmentNote.trim()) {
    lines.push(`Equipment note: ${visitNotes.equipmentNote.trim()}`);
  }
  if (contact.customerComment.trim()) {
    lines.push(`Customer comment: ${contact.customerComment.trim()}`);
  }

  return lines.join("\n");
}

export function packageForCondition(
  condition: ApartmentCondition | null
): MoveOutPackage | null {
  if (!condition) return null;
  if (condition === "heavy_grease_limescale") return "premium";
  if (condition === "well_maintained" || condition === "normal_wear") return "standard";
  return null;
}

export function shouldRecommendPremium(
  packageType: MoveOutPackage | null,
  state: Pick<MoveOutWizardState, "extras" | "apartmentCondition">
): boolean {
  if (packageType === "premium") return false;
  if (conditionSuggestsPremium(state.apartmentCondition)) return true;
  return state.extras.heavyLimescale || state.extras.heavyDirt;
}

export function getActiveExtras(state: MoveOutWizardState): Array<keyof MoveOutWizardState["extras"]> {
  return (Object.keys(state.extras) as Array<keyof MoveOutWizardState["extras"]>).filter(
    (key) => state.extras[key]
  );
}
