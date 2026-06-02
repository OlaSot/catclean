import type { OrderServiceType } from "@/lib/constants/orders";
import { tryCalculateOrderPrice } from "@/lib/pricing/calculate-order-price";
import type {
  BookingEstimate,
  BookingServicePreset,
  HomeResetCondition,
  BookingWizardState,
} from "./booking-wizard.types";

export function mapServicePresetToOrderService(
  preset: BookingServicePreset | null
): OrderServiceType | null {
  if (preset === "move_out") return "move_in_out";
  if (preset === "home_reset" || preset === "regular_cleaning") {
    return "regular_cleaning";
  }
  if (preset === "office_cleaning") return "office_cleaning";
  if (preset === "dry_cleaning") return "dry_cleaning";
  if (preset === "window_cleaning") return "window_cleaning";
  return null;
}

export function buildServiceDetailsForPricing(state: BookingWizardState): Record<string, unknown> | null {
  const propertySizeM2 = Number(state.propertySizeM2);
  if (!Number.isFinite(propertySizeM2) || propertySizeM2 <= 0) return null;

  if (state.service === "move_out") {
    return {
      propertySizeM2,
      packageType: "standard",
      ovenCleaning: state.extras.ovenCleaning,
      fridgeCleaning: state.extras.fridgeCleaning,
      insideCabinets: state.extras.insideCabinets,
      windowsInside: state.extras.interiorWindows,
      balconyIncluded: state.extras.balcony,
    };
  }

  if (state.service === "office_cleaning") {
    return { officeSizeM2: propertySizeM2 };
  }

  if (state.service === "dry_cleaning" || state.service === "window_cleaning") {
    return { propertySizeM2 };
  }

  const intensity: HomeResetCondition = state.condition;
  return {
    propertySizeM2,
    cleaningIntensity: intensity === "deep" ? "deep" : "standard",
    roomsCount: state.roomsCount,
    bathroomsCount: state.bathroomsCount,
    ovenCleaning: state.extras.ovenCleaning,
    fridgeCleaning: state.extras.fridgeCleaning,
    insideCabinets: state.extras.insideCabinets,
    balconyIncluded: state.extras.balcony,
    hasPets: state.petsOption !== "no_pets",
  };
}

export function calculateBookingEstimate(state: BookingWizardState): BookingEstimate {
  const serviceType = mapServicePresetToOrderService(state.service);
  if (!serviceType) return { price: null, durationMinutes: null };

  const details = buildServiceDetailsForPricing(state);
  if (!details) return { price: null, durationMinutes: null };

  const result = tryCalculateOrderPrice(serviceType, details);
  if (!result) return { price: null, durationMinutes: null };

  return {
    price: result.estimatedPrice,
    durationMinutes: result.estimatedDurationMinutes,
  };
}

export function formatDuration(minutes: number | null): string {
  if (minutes == null) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatPrice(price: number | null): string {
  if (price == null) return "—";
  return `€${price.toFixed(2)}`;
}

export function serializeVisitDetails(state: BookingWizardState): string {
  const lines: string[] = [];
  lines.push(`Property type: ${state.propertyType ?? "unknown"}`);
  lines.push(`Condition: ${state.condition}`);
  lines.push(`Rooms: ${state.roomsCount}`);
  lines.push(`Bathrooms: ${state.bathroomsCount}`);
  lines.push(`Kitchens: ${state.kitchenCount}`);
  if (state.hallwayCount != null) lines.push(`Hallways: ${state.hallwayCount}`);
  lines.push(`Pets: ${state.petsOption}`);
  if (state.petsOption !== "no_pets") {
    lines.push(`Pet hair level: ${state.petHairLevel}`);
  }
  if (state.petsInfo.trim()) {
    lines.push(`Pets info: ${state.petsInfo.trim()}`);
  }
  const unsupportedExtras: string[] = [];
  if (state.extras.interiorWindows) unsupportedExtras.push("Interior windows");
  if (state.extras.changeBedLinen) unsupportedExtras.push("Change bed linen");
  if (unsupportedExtras.length > 0) {
    lines.push(`Manual extras: ${unsupportedExtras.join(", ")}`);
  }
  lines.push(`Supplies: ${state.suppliesChoice}`);
  lines.push(`Vacuum: ${state.vacuumChoice}`);
  if (state.accessInstructions.trim()) {
    lines.push(`Access instructions: ${state.accessInstructions.trim()}`);
  }
  if (state.parkingElevatorNote.trim()) {
    lines.push(`Parking/elevator note: ${state.parkingElevatorNote.trim()}`);
  }
  if (state.additionalComment.trim()) {
    lines.push(`Additional comment: ${state.additionalComment.trim()}`);
  }
  return lines.join("\n");
}
