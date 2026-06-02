/** Service-specific fields on the create-order form (camelCase). */
export type CreateOrderServiceDetailsForm = {
  propertySizeM2: string;
  roomsCount: string;
  bathroomsCount: string;
  cleaningIntensity: "standard" | "deep";
  hasPets: boolean;
  ovenCleaning: boolean;
  fridgeCleaning: boolean;
  insideCabinets: boolean;
  balconyIncluded: boolean;
  packageType: "standard" | "premium";
  emptyApartment: boolean;
  windowsInside: boolean;
  officeSizeM2: string;
  workstationsCount: string;
};

export const EMPTY_CREATE_ORDER_SERVICE_DETAILS: CreateOrderServiceDetailsForm =
  {
    propertySizeM2: "",
    roomsCount: "",
    bathroomsCount: "",
    cleaningIntensity: "standard",
    hasPets: false,
    ovenCleaning: false,
    fridgeCleaning: false,
    insideCabinets: false,
    balconyIncluded: false,
    packageType: "standard",
    emptyApartment: false,
    windowsInside: false,
    officeSizeM2: "",
    workstationsCount: "",
  };
