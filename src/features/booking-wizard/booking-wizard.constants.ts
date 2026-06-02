import type { BookingWizardState, StepDef } from "./booking-wizard.types";

export const HOME_RESET_STEPS: StepDef[] = [
  { id: "service", label: "Service" },
  { id: "propertyType", label: "Property type" },
  { id: "propertySize", label: "Size" },
  { id: "rooms", label: "Rooms" },
  { id: "condition", label: "Condition" },
  { id: "pets", label: "Pets" },
  { id: "extras", label: "Extras" },
  { id: "supplies", label: "Supplies" },
  { id: "visitDetails", label: "Visit details" },
  { id: "address", label: "Address" },
  { id: "schedule", label: "Date & time" },
  { id: "contact", label: "Contact" },
  { id: "summary", label: "Summary" },
];

export const SIMPLE_STEPS: StepDef[] = [
  { id: "service", label: "Service" },
  { id: "propertySize", label: "Size" },
  { id: "address", label: "Address" },
  { id: "schedule", label: "Date & time" },
  { id: "contact", label: "Contact" },
  { id: "summary", label: "Summary" },
];

export const SIZE_PRESETS = [40, 60, 80, 100, 120];

export const EMPTY_BOOKING_STATE: BookingWizardState = {
  service: null,
  propertyType: null,
  propertySizeM2: 60,
  roomsCount: 2,
  bathroomsCount: 1,
  kitchenCount: 1,
  hallwayCount: null,
  condition: "standard",
  petsOption: "no_pets",
  petHairLevel: "medium",
  petsInfo: "",
  extras: {
    ovenCleaning: false,
    fridgeCleaning: false,
    insideCabinets: false,
    balcony: false,
    interiorWindows: false,
    changeBedLinen: false,
  },
  suppliesChoice: "have_supplies",
  vacuumChoice: "have_vacuum",
  accessInstructions: "",
  parkingElevatorNote: "",
  additionalComment: "",
  address: {
    street: "",
    houseNumber: "",
    apartment: "",
    zip: "",
    city: "",
    floor: "",
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
