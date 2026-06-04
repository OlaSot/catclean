import { MOVE_OUT_DEFAULT_SIZE_M2 } from "./move-out-wizard.constants";
import type { MoveOutWizardState } from "./move-out-wizard.types";

export const INITIAL_MOVE_OUT_STATE: MoveOutWizardState = {
  package: null,
  apartmentCondition: null,
  propertySizeM2: MOVE_OUT_DEFAULT_SIZE_M2,
  extras: {
    emptyApartment: false,
    heavyLimescale: false,
    heavyDirt: false,
    insideCabinets: true,
    fridgeCleaning: true,
    ovenCleaning: true,
    windowsInside: false,
    balconyIncluded: false,
  },
  visitNotes: {
    accessNotes: "",
    petsInfo: "",
    suppliesNote: "",
    equipmentNote: "",
  },
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
    customerComment: "",
  },
};
