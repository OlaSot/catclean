export type MoveOutPackage = "standard" | "premium";

export type ApartmentCondition =
  | "well_maintained"
  | "normal_wear"
  | "heavy_grease_limescale"
  | "not_sure";

export type MoveOutExtras = {
  emptyApartment: boolean;
  heavyLimescale: boolean;
  heavyDirt: boolean;
  insideCabinets: boolean;
  fridgeCleaning: boolean;
  ovenCleaning: boolean;
  windowsInside: boolean;
  balconyIncluded: boolean;
};

export type MoveOutVisitNotes = {
  accessNotes: string;
  petsInfo: string;
  suppliesNote: string;
  equipmentNote: string;
};

export type MoveOutAddress = {
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
};

export type MoveOutSchedule = {
  date: string;
  time: string;
};

export type MoveOutContact = {
  name: string;
  phone: string;
  email: string;
  customerComment: string;
};

export type MoveOutWizardState = {
  package: MoveOutPackage | null;
  apartmentCondition: ApartmentCondition | null;
  propertySizeM2: number;
  extras: MoveOutExtras;
  visitNotes: MoveOutVisitNotes;
  address: MoveOutAddress;
  schedule: MoveOutSchedule;
  contact: MoveOutContact;
};

export type MoveOutEstimate = {
  price: number | null;
  durationMinutes: number | null;
  durationLabel: string | null;
};

export type SubmitResult = {
  orderId: string;
  status: string;
  confirmationPending: boolean;
};
