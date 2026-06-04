import { EMPTY_WINDOW_EXTRAS } from "./window-cleaning.data";
import { createEmptyQuantities } from "./window-cleaning.utils";
import type { WindowCleaningWizardState } from "./window-cleaning.types";

export const INITIAL_WINDOW_CLEANING_STATE: WindowCleaningWizardState = {
  quantities: createEmptyQuantities(),
  details: {
    insideOnly: null,
    outsideRequired: null,
    access: null,
  },
  extras: { ...EMPTY_WINDOW_EXTRAS },
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
    time: "",
  },
  contact: {
    name: "",
    phone: "",
    email: "",
  },
};
