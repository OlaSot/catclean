import type { HomeCareWizardState } from "./home-care-wizard.types";

export const INITIAL_HOME_CARE_STATE: HomeCareWizardState = {
  frequency: "biweekly",
  propertyType: null,
  propertySizeM2: 80,
  petsOption: "no_pets",
  enhancements: {
    oven_refresh: false,
    fridge_refresh: false,
    inside_cabinets: false,
    balcony_cleaning: false,
    window_cleaning: false,
  },
  address: {
    street: "",
    houseNumber: "",
    apartment: "",
    zip: "",
    city: "",
    floor: "",
    accessNotes: "",
  },
  schedule: {
    date: "",
    time: "",
  },
  contact: {
    name: "",
    phone: "",
    email: "",
    notes: "",
  },
};
