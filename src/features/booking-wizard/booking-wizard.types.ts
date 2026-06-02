export type BookingServicePreset =
  | "home_reset"
  | "move_out"
  | "regular_cleaning"
  | "dry_cleaning"
  | "office_cleaning"
  | "window_cleaning";

export type HomeResetPropertyType = "apartment" | "house";
export type HomeResetCondition = "light" | "standard" | "deep";
export type HomeResetPetsOption = "no_pets" | "cat" | "dog" | "multiple";
export type HomeResetPetHairLevel = "low" | "medium" | "high";

export type BookingExtras = {
  ovenCleaning: boolean;
  fridgeCleaning: boolean;
  insideCabinets: boolean;
  balcony: boolean;
  interiorWindows: boolean;
  changeBedLinen: boolean;
};

export type BookingWizardState = {
  service: BookingServicePreset | null;
  propertyType: HomeResetPropertyType | null;
  propertySizeM2: number;
  roomsCount: number;
  bathroomsCount: number;
  kitchenCount: number;
  hallwayCount: number | null;
  condition: HomeResetCondition;
  petsOption: HomeResetPetsOption;
  petHairLevel: HomeResetPetHairLevel;
  petsInfo: string;
  extras: BookingExtras;
  suppliesChoice: "have_supplies" | "bring_supplies";
  vacuumChoice: "have_vacuum" | "bring_vacuum";
  accessInstructions: string;
  parkingElevatorNote: string;
  additionalComment: string;
  address: {
    street: string;
    houseNumber: string;
    apartment: string;
    zip: string;
    city: string;
    floor: string;
  };
  schedule: {
    date: string;
    time: string;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
  };
};

export type StepId =
  | "service"
  | "propertyType"
  | "propertySize"
  | "rooms"
  | "condition"
  | "pets"
  | "extras"
  | "supplies"
  | "visitDetails"
  | "address"
  | "schedule"
  | "contact"
  | "summary";

export type StepDef = {
  id: StepId;
  label: string;
};

export type BookingEstimate = {
  price: number | null;
  durationMinutes: number | null;
};
