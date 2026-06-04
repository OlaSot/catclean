export type HomeCareFrequency = "one_time" | "weekly" | "biweekly" | "monthly";

export type HomeCarePropertyType = "apartment" | "house";

export type HomeCarePetsOption = "no_pets" | "cat" | "dog" | "multiple";

export type HomeCareEnhancement =
  | "oven_refresh"
  | "fridge_refresh"
  | "inside_cabinets"
  | "balcony_cleaning"
  | "window_cleaning";

export type HomeCareEnhancements = Record<HomeCareEnhancement, boolean>;

export type HomeCareAddress = {
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
  accessNotes: string;
};

export type HomeCareSchedule = {
  date: string;
  time: string;
};

export type HomeCareContact = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export type HomeCareWizardState = {
  frequency: HomeCareFrequency;
  propertyType: HomeCarePropertyType | null;
  propertySizeM2: number;
  petsOption: HomeCarePetsOption;
  enhancements: HomeCareEnhancements;
  address: HomeCareAddress;
  schedule: HomeCareSchedule;
  contact: HomeCareContact;
};

export type HomeCareEstimate = {
  price: number | null;
  durationMinutes: number | null;
};

export type SubmitResult = {
  orderId: string;
  status: string;
  confirmationPending: boolean;
};
