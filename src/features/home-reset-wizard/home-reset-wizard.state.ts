import type { HomeResetWizardState } from "./home-reset-wizard.types";

export const INITIAL_HOME_RESET_STATE: HomeResetWizardState = {
  propertyType: null,
  propertySizeM2: 80,
  deepUpgrades: {
    kitchen: false,
    bathroom: false,
  },
  petsOption: "no_pets",
  enhancements: {
    oven_refresh: false,
    fridge_refresh: false,
    balcony_cleaning: false,
  },
  specialRequest: "",
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
