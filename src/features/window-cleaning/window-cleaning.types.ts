export type WindowItemId =
  | "window_s"
  | "window_m"
  | "window_l"
  | "window_xl"
  | "balcony_door"
  | "sliding_terrace_door"
  | "double_glass_door"
  | "commercial_entrance_door";

export type WindowSizeFrame = "s" | "m" | "l" | "xl";

export type WindowItemKind = "window" | "door";

export type WindowAccessLevel = "easy" | "ladder" | "difficult";

export type WindowExtraId =
  | "blinds"
  | "shutters"
  | "frame_deep"
  | "water_stains"
  | "after_renovation";

export type WindowItem = {
  id: WindowItemId;
  kind: WindowItemKind;
  title: string;
  subtitle: string;
  sizeDescription?: string;
  sizeBadge?: string;
  sizeFrame?: WindowSizeFrame;
  priceFrom: number;
  durationMinutes: number;
  imageSrc?: string;
};

export type WindowCleaningExtras = Record<WindowExtraId, boolean>;

export type WindowCleaningDetails = {
  insideOnly: boolean | null;
  outsideRequired: boolean | null;
  access: WindowAccessLevel | null;
};

export type WindowCleaningAddress = {
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
};

export type WindowCleaningSchedule = {
  date: string;
  time: string;
};

export type WindowCleaningContact = {
  name: string;
  phone: string;
  email: string;
};

export type WindowCleaningQuantities = Record<WindowItemId, number>;

export type WindowCleaningWizardState = {
  quantities: WindowCleaningQuantities;
  details: WindowCleaningDetails;
  extras: WindowCleaningExtras;
  address: WindowCleaningAddress;
  schedule: WindowCleaningSchedule;
  contact: WindowCleaningContact;
};

export type WindowCleaningEstimate = {
  price: number;
  durationMinutes: number;
};
