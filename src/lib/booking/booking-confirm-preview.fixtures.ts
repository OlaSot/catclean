import type { HomeCareWizardState } from "@/features/home-care-wizard/home-care-wizard.types";
import type { HomeResetWizardState } from "@/features/home-reset-wizard/home-reset-wizard.types";
import type { MoveOutWizardState } from "@/features/move-out-wizard/move-out-wizard.types";
import { INITIAL_HOME_CARE_STATE } from "@/features/home-care-wizard/home-care-wizard.state";
import { INITIAL_HOME_RESET_STATE } from "@/features/home-reset-wizard/home-reset-wizard.state";
import { INITIAL_MOVE_OUT_STATE } from "@/features/move-out-wizard/move-out-wizard.state";
import { INITIAL_WINDOW_CLEANING_STATE } from "@/features/window-cleaning/window-cleaning.state";
import type { WindowCleaningWizardState } from "@/features/window-cleaning/window-cleaning.types";
import { calculateHomeCareEstimate } from "@/features/home-care-wizard/home-care-wizard.utils";
import { calculateHomeResetEstimate } from "@/features/home-reset-wizard/home-reset-wizard.utils";
import { getMoveOutEstimate } from "@/features/move-out-wizard/move-out-wizard.utils";
import { calculateWindowCleaningEstimate } from "@/features/window-cleaning/window-cleaning.utils";
import type { BookingServiceParam } from "@/lib/booking/booking-services";

/** Stable demo date (Friday) for confirm-step previews. */
const PREVIEW_SCHEDULE = {
  date: "2026-06-26",
  time: "13:00",
};

const PREVIEW_ADDRESS = {
  street: "Leopoldstraße",
  houseNumber: "12",
  apartment: "4A",
  zip: "80802",
  city: "München",
  floor: "3",
  accessNotes: "Gate code 4821",
};

const PREVIEW_CONTACT = {
  name: "Anna Schmidt",
  phone: "+49 178 1234567",
  email: "anna@example.com",
  notes: "",
};

export const HOME_RESET_CONFIRM_PREVIEW_STATE: HomeResetWizardState = {
  ...INITIAL_HOME_RESET_STATE,
  propertyType: "apartment",
  propertySizeM2: 130,
  deepUpgrades: { kitchen: true, bathroom: true },
  petsOption: "multiple",
  enhancements: {
    oven_refresh: false,
    fridge_refresh: false,
    balcony_cleaning: true,
  },
  specialRequest: "Please pay extra attention to the kitchen backsplash.",
  address: { ...PREVIEW_ADDRESS },
  schedule: { ...PREVIEW_SCHEDULE },
  contact: { ...PREVIEW_CONTACT },
};

export const HOME_CARE_CONFIRM_PREVIEW_STATE: HomeCareWizardState = {
  ...INITIAL_HOME_CARE_STATE,
  frequency: "biweekly",
  propertyType: "apartment",
  propertySizeM2: 95,
  petsOption: "cat",
  enhancements: {
    oven_refresh: true,
    fridge_refresh: false,
    inside_cabinets: false,
    balcony_cleaning: false,
    window_cleaning: true,
  },
  address: { ...PREVIEW_ADDRESS },
  schedule: { ...PREVIEW_SCHEDULE },
  contact: { ...PREVIEW_CONTACT },
};

export const MOVE_OUT_CONFIRM_PREVIEW_STATE: MoveOutWizardState = {
  ...INITIAL_MOVE_OUT_STATE,
  package: "premium",
  apartmentCondition: "well_maintained",
  propertySizeM2: 72,
  visitNotes: {
    accessNotes: "Key in lockbox by entrance",
    petsInfo: "No pets",
    suppliesNote: "",
    equipmentNote: "",
  },
  address: {
    street: PREVIEW_ADDRESS.street,
    houseNumber: PREVIEW_ADDRESS.houseNumber,
    apartment: PREVIEW_ADDRESS.apartment,
    zip: PREVIEW_ADDRESS.zip,
    city: PREVIEW_ADDRESS.city,
    floor: PREVIEW_ADDRESS.floor,
  },
  schedule: { ...PREVIEW_SCHEDULE },
  contact: {
    name: PREVIEW_CONTACT.name,
    phone: PREVIEW_CONTACT.phone,
    email: PREVIEW_CONTACT.email,
    customerComment: "",
  },
};

export const WINDOW_CLEANING_CONFIRM_PREVIEW_STATE: WindowCleaningWizardState = {
  ...INITIAL_WINDOW_CLEANING_STATE,
  quantities: {
    ...INITIAL_WINDOW_CLEANING_STATE.quantities,
    window_m: 4,
    window_s: 2,
  },
  details: {
    insideOnly: true,
    outsideRequired: false,
    access: "easy",
  },
  extras: {
    ...INITIAL_WINDOW_CLEANING_STATE.extras,
    frame_deep: true,
  },
  address: {
    street: PREVIEW_ADDRESS.street,
    houseNumber: PREVIEW_ADDRESS.houseNumber,
    apartment: PREVIEW_ADDRESS.apartment,
    zip: PREVIEW_ADDRESS.zip,
    city: PREVIEW_ADDRESS.city,
    floor: PREVIEW_ADDRESS.floor,
  },
  schedule: { ...PREVIEW_SCHEDULE },
  contact: {
    name: PREVIEW_CONTACT.name,
    phone: PREVIEW_CONTACT.phone,
    email: PREVIEW_CONTACT.email,
  },
};

export type BookingConfirmPreviewService = Extract<
  BookingServiceParam,
  "home_reset" | "home_care" | "move_out" | "window_cleaning"
>;

export const BOOKING_CONFIRM_PREVIEW_SERVICES: BookingConfirmPreviewService[] = [
  "home_reset",
  "home_care",
  "move_out",
  "window_cleaning",
];

export function resolveBookingConfirmPreviewService(
  raw: string | undefined,
): BookingConfirmPreviewService {
  if (raw === "home_care" || raw === "move_out" || raw === "window_cleaning") {
    return raw;
  }
  return "home_reset";
}

export function getBookingConfirmPreviewEstimate(service: BookingConfirmPreviewService): number {
  switch (service) {
    case "home_care":
      return calculateHomeCareEstimate(HOME_CARE_CONFIRM_PREVIEW_STATE).price ?? 189;
    case "move_out":
      return getMoveOutEstimate(MOVE_OUT_CONFIRM_PREVIEW_STATE).price ?? 349;
    case "window_cleaning": {
      const result = calculateWindowCleaningEstimate(WINDOW_CLEANING_CONFIRM_PREVIEW_STATE);
      return result.price ?? 120;
    }
    default:
      return calculateHomeResetEstimate(HOME_RESET_CONFIRM_PREVIEW_STATE).price ?? 423;
  }
}

export function getWindowCleaningPreviewDuration(): number {
  return calculateWindowCleaningEstimate(WINDOW_CLEANING_CONFIRM_PREVIEW_STATE).durationMinutes ?? 90;
}
