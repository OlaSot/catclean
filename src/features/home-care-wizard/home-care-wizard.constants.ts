import type { HomeCareEnhancement, HomeCareFrequency, HomeCarePetsOption } from "./home-care-wizard.types";

export const HOME_CARE_SERVICE_PARAM = "home_care";

export const BOOKING_PRODUCT_HOME_CARE = "home_care" as const;

export const HOME_CARE_TOTAL_STEPS = 8;

export const HOME_CARE_WIZARD_STEPS = [
  { id: 1, label: "Frequency" },
  { id: 2, label: "Your home" },
  { id: 3, label: "Pets" },
  { id: 4, label: "Extra care" },
  { id: 5, label: "Schedule" },
  { id: 6, label: "Address" },
  { id: 7, label: "Contact" },
  { id: 8, label: "Summary" },
] as const;

export const FREQUENCY_OPTIONS: Array<{
  id: HomeCareFrequency;
  label: string;
  subtitle?: string;
}> = [
  { id: "one_time", label: "One-time" },
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Every 2 weeks" },
  { id: "monthly", label: "Every 4 weeks" },
];

export const SIZE_PRESETS = [40, 60, 80, 100, 120] as const;
export const SIZE_MIN_M2 = 30;
export const SIZE_MAX_M2 = 200;

export const PETS_OPTIONS: Array<{ id: HomeCarePetsOption; label: string }> = [
  { id: "no_pets", label: "No pets" },
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "multiple", label: "Multiple pets" },
];

export const ENHANCEMENT_OPTIONS: Array<{
  id: HomeCareEnhancement;
  title: string;
  priceLabel?: string;
}> = [
  { id: "oven_refresh", title: "Inside Oven", priceLabel: "+€25" },
  { id: "fridge_refresh", title: "Inside Fridge", priceLabel: "+€20" },
  { id: "inside_cabinets", title: "Inside Cabinets", priceLabel: "+€30" },
  { id: "balcony_cleaning", title: "Balcony Cleaning", priceLabel: "+€20" },
  {
    id: "window_cleaning",
    title: "Window Cleaning",
    priceLabel: "+€35",
  },
];

export type HomeCareScopeSection = { title: string; items: string[] };

export const HOME_CARE_INCLUDED_SECTIONS: HomeCareScopeSection[] = [
  {
    title: "Kitchen",
    items: [
      "Countertops",
      "Sink",
      "Faucet",
      "Exterior appliance surfaces",
      "General tidying",
    ],
  },
  {
    title: "Bathroom",
    items: ["Sink", "Toilet", "Shower / bathtub", "Mirror", "Faucet"],
  },
  {
    title: "Living Areas",
    items: ["Dust removal", "Vacuuming", "Floor cleaning", "Accessible surfaces"],
  },
  {
    title: "Bedrooms",
    items: ["Dust removal", "Vacuuming", "Floor cleaning", "Bed making"],
  },
  {
    title: "Entire Home",
    items: ["Trash removal", "Light switches", "Door handles"],
  },
];

export const HOME_CARE_NOT_INCLUDED: string[] = [
  "Interior oven cleaning",
  "Interior fridge cleaning",
  "Interior cabinet cleaning",
  "Heavy grease removal",
  "Heavy limescale treatment",
  "Kitchen Deep Reset",
  "Bathroom Deep Reset",
  "Post-renovation cleaning",
  "Move out cleaning",
];

export const TIME_SLOTS = [
  { id: "09:00", label: "09:00 – 11:00" },
  { id: "11:00", label: "11:00 – 13:00" },
  { id: "13:00", label: "13:00 – 15:00" },
  { id: "15:00", label: "15:00 – 17:00" },
  { id: "17:00", label: "17:00 – 19:00" },
] as const;
