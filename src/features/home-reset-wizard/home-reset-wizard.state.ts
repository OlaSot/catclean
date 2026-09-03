import type { HomeResetWizardState } from "./home-reset-wizard.types";

export const INITIAL_HOME_RESET_STATE: HomeResetWizardState = {
  propertyType: null,
  propertySizeM2: 80,
  floorsCount: 2,
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
    googlePlaceId: "",
    latitude: null,
    longitude: null,
    serviceAreaValidated: false,
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
