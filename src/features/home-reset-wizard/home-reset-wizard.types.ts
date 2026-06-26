export type HomeResetPropertyType = "apartment" | "house";

export type HomeResetUpgrade =
  | "standard_home_reset"
  | "kitchen_upgrade"
  | "bathroom_upgrade";

/** Optional deep-reset add-ons on top of Standard Home Reset. */
export type HomeResetDeepUpgrades = {
  kitchen: boolean;
  bathroom: boolean;
};

export type HomeResetPetsOption = "no_pets" | "cat" | "dog" | "multiple";

export type HomeResetEnhancement = "oven_refresh" | "fridge_refresh" | "balcony_cleaning";

export type HomeResetEnhancements = Record<HomeResetEnhancement, boolean>;

export type HomeResetAddress = {
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
  accessNotes: string;
};

export type HomeResetSchedule = {
  date: string;
  time: string;
};

export type HomeResetContact = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export type HomeResetWizardState = {
  propertyType: HomeResetPropertyType | null;
  propertySizeM2: number;
  deepUpgrades: HomeResetDeepUpgrades;
  petsOption: HomeResetPetsOption;
  enhancements: HomeResetEnhancements;
  specialRequest: string;
  address: HomeResetAddress;
  schedule: HomeResetSchedule;
  contact: HomeResetContact;
};

export type HomeResetEstimate = {
  price: number | null;
  durationMinutes: number | null;
};

export type SubmitResult = {
  orderId: string;
  status: string;
  confirmationPending: boolean;
};
