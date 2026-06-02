import type { OrderServiceType } from "@/lib/constants/orders";

/** Normalized detail payload per service (camelCase keys). */
export type RegularCleaningServiceDetailsData = {
  propertySizeM2?: number | null;
  cleaningIntensity?: string | null;
  roomsCount?: number | null;
  bedroomsCount?: number | null;
  bathroomsCount?: number | null;
  kitchenIncluded?: boolean | null;
  livingRoomIncluded?: boolean | null;
  corridorIncluded?: boolean | null;
  balconyIncluded?: boolean | null;
  fridgeCleaning?: boolean | null;
  ovenCleaning?: boolean | null;
  insideCabinets?: boolean | null;
  windowsInside?: boolean | null;
  hasPets?: boolean | null;
  petType?: string | null;
  extraHours?: number | null;
  suppliesProvidedBy?: string | null;
  equipmentRequired?: string[] | null;
};

export type MoveCleaningServiceDetailsData = {
  propertySizeM2?: number | null;
  packageType?: string | null;
  isMoveIn?: boolean | null;
  isMoveOut?: boolean | null;
  emptyApartment?: boolean | null;
  heavyLimescale?: boolean | null;
  heavyDirt?: boolean | null;
  insideCabinets?: boolean | null;
  fridgeCleaning?: boolean | null;
  ovenCleaning?: boolean | null;
  windowsInside?: boolean | null;
  balconyIncluded?: boolean | null;
};

export type AirbnbServiceDetailsData = {
  linenChange?: boolean | null;
  towelsChange?: boolean | null;
  laundryRequired?: boolean | null;
  consumablesRestock?: boolean | null;
  photoReportRequired?: boolean | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  keysLocation?: string | null;
  specialTurnoverNotes?: string | null;
  propertySizeM2?: number | null;
  bedroomsCount?: number | null;
  bathroomsCount?: number | null;
};

export type OfficeCleaningServiceDetailsData = {
  officeSizeM2?: number | null;
  workstationsCount?: number | null;
  meetingRoomsCount?: number | null;
  bathroomsCount?: number | null;
  kitchenArea?: boolean | null;
  frequency?: string | null;
  afterHours?: boolean | null;
  trashRemoval?: boolean | null;
  suppliesRestock?: boolean | null;
};

export type DryCleaningServiceDetailsData = {
  sofasCount?: number | null;
  mattressesCount?: number | null;
  carpetsCount?: number | null;
  carpetAreaM2?: number | null;
  chairsCount?: number | null;
  materialNotes?: string | null;
  stainsDescription?: string | null;
  petStains?: boolean | null;
  elevatorAvailable?: boolean | null;
};

export type WindowCleaningServiceDetailsData = {
  windowsCount?: number | null;
  windowSashesCount?: number | null;
  balconyDoorsCount?: number | null;
  outsideAccess?: boolean | null;
  ladderRequired?: boolean | null;
  frameCleaning?: boolean | null;
  blindsCleaning?: boolean | null;
  interiorOnly?: boolean | null;
  highRise?: boolean | null;
};

export type SpecialPackageServiceDetailsData = {
  packageFocus?: string | null;
  allergyFriendlyProducts?: boolean | null;
  petAreaDescription?: string | null;
  hasPets?: boolean | null;
  petTypes?: string | null;
};

export type AdminOrderServiceDetails =
  | { type: "regular_cleaning"; data: RegularCleaningServiceDetailsData }
  | { type: "move_in_out"; data: MoveCleaningServiceDetailsData }
  | { type: "airbnb_turnover"; data: AirbnbServiceDetailsData }
  | { type: "office_cleaning"; data: OfficeCleaningServiceDetailsData }
  | { type: "dry_cleaning"; data: DryCleaningServiceDetailsData }
  | { type: "window_cleaning"; data: WindowCleaningServiceDetailsData }
  | { type: "special_pet_package"; data: SpecialPackageServiceDetailsData };

export type ServiceDetailDisplayField = {
  key: string;
  label: string;
  category: "pricing" | "cleaner" | "general";
  valueType: "boolean" | "number" | "string" | "stringArray";
};
