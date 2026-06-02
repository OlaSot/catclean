export type ServiceId = "home_reset" | "move_out" | "regular_cleaning";

export type CleaningAreaKey = "kitchen" | "bathroom" | "living";

export type CleaningArea = {
  key: CleaningAreaKey;
  title: string;
  visualLabel: string;
  visualAccent: string;
  cta: string;
  items: string[];
};

export type ServiceAddOn = {
  title: string;
  description: string;
  price: string;
};

export type ServiceProfile = {
  id: ServiceId;
  title: string;
  tagline: string;
  shortDescription: string;
  cleaningAreas: CleaningArea[];
  included: string[];
  addOns: ServiceAddOn[];
};

export type ComparisonCell =
  | { kind: "yes" }
  | { kind: "no" }
  | { kind: "partial"; label?: string }
  | { kind: "text"; label: string };

export type ComparisonRow = {
  feature: string;
  hint?: string;
  home_reset: ComparisonCell;
  move_out: ComparisonCell;
  regular_cleaning: ComparisonCell;
};
