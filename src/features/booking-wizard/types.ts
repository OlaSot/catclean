export type BookingWizardStep =
  | "service"
  | "size"
  | "extras"
  | "visit"
  | "address"
  | "schedule"
  | "contact"
  | "summary";

export type BookingServicePreset = "home_reset" | "move_out" | "regular_cleaning";

export type BookingExtras = {
  ovenCleaning: boolean;
  fridgeCleaning: boolean;
  insideCabinets: boolean;
  balcony: boolean;
  windows: boolean;
  pets: boolean;
};

export type BookingVisitDetails = {
  petsInfo: string;
  accessInstructions: string;
  equipmentNote: string;
  additionalComment: string;
};

export type BookingAddress = {
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
};

export type BookingSchedule = {
  date: string;
  time: string;
};

export type BookingContact = {
  name: string;
  phone: string;
  email: string;
};

export type BookingEstimate = {
  price: number | null;
  durationMinutes: number | null;
};

export type BookingWizardState = {
  service: BookingServicePreset | null;
  propertySizeM2: string;
  extras: BookingExtras;
  visitDetails: BookingVisitDetails;
  address: BookingAddress;
  schedule: BookingSchedule;
  contact: BookingContact;
};

export const BOOKING_WIZARD_STEPS: BookingWizardStep[] = [
  "service",
  "size",
  "extras",
  "visit",
  "address",
  "schedule",
  "contact",
  "summary",
];

export const EMPTY_BOOKING_STATE: BookingWizardState = {
  service: null,
  propertySizeM2: "",
  extras: {
    ovenCleaning: false,
    fridgeCleaning: false,
    insideCabinets: false,
    balcony: false,
    windows: false,
    pets: false,
  },
  visitDetails: {
    petsInfo: "",
    accessInstructions: "",
    equipmentNote: "",
    additionalComment: "",
  },
  address: {
    street: "",
    houseNumber: "",
    apartment: "",
    zip: "",
    city: "",
  },
  schedule: {
    date: "",
    time: "09:00",
  },
  contact: {
    name: "",
    phone: "",
    email: "",
  },
};
