import type {
  HomeResetPetsOption,
  HomeResetUpgrade,
  HomeResetEnhancement,
} from "./home-reset-wizard.types";

export const BOOKING_PRODUCT_HOME_RESET = "home_reset" as const;
import { HOME_RESET_UPGRADE_SURCHARGE_EUR } from "@/lib/orders/home-reset-upgrade";
import {
  CalendarOff,
  Droplets,
  PawPrint,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const HOME_RESET_WELCOME_BENEFITS: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Deep Refresh",
    icon: Sparkles,
    description: "More detailed than regular cleaning.",
  },
  {
    title: "Pet-Friendly by Design",
    icon: PawPrint,
    description: "Created for homes with pets.",
  },
  {
    title: "Steam Cleaning Available",
    icon: Droplets,
    description: "For kitchens and bathrooms that need extra care.",
  },
  {
    title: "No Subscription Required",
    icon: CalendarOff,
    description: "Book only when you need a reset.",
  },
];

export const HOME_RESET_TOTAL_STEPS = 10;

export const HOME_RESET_WIZARD_STEPS = [
  { id: 1, label: "Welcome Home" },
  { id: 2, label: "Your home" },
  { id: 3, label: "Pets" },
  { id: 4, label: "Customize" },
  { id: 5, label: "Extras" },
  { id: 6, label: "Special requests" },
  { id: 7, label: "Schedule" },
  { id: 8, label: "Address" },
  { id: 9, label: "Contact" },
  { id: 10, label: "Summary" },
] as const;

export const SIZE_MIN_M2 = 30;
export const SIZE_MAX_M2 = 150;

export type HomeResetScopeSection = { title: string; items: string[] };

/** Standard Home Reset scope — included in every booking. */
export const STANDARD_HOME_RESET_SCOPE: HomeResetScopeSection[] = [
  {
    title: "Kitchen",
    items: [
      "Countertops",
      "Sink",
      "Faucet",
      "Stovetop",
      "Exterior appliance surfaces",
      "Exterior cabinet fronts",
    ],
  },
  {
    title: "Bathroom",
    items: [
      "Sink",
      "Faucet",
      "Mirror",
      "Toilet",
      "Shower",
      "Bathtub",
      "Standard dirt removal",
    ],
  },
  {
    title: "Living Areas",
    items: ["Dust removal", "Accessible surfaces", "Window sills", "Floor cleaning"],
  },
  {
    title: "Entire Home",
    items: ["Door handles", "Light switches", "Trash removal"],
  },
];

/** Included automatically when the customer has pets — not a paid customize option. */
export const PET_HOME_UPGRADE = {
  title: "Pet Home Upgrade",
  summaryLabel: "Pet Home Upgrade Included",
  petsStepTitle: "Pet Home Upgrade Included",
  petsStepIntro:
    "Because your home has pets, we'll automatically provide additional attention to:",
  petsStepBullets: [
    "Pet hair removal",
    "Sofas and pet areas",
    "Pet beds",
    "Additional vacuuming",
  ],
  includedBadge: "Included for Pet Homes",
  cardDescription: "Included for pet homes.",
  cardBenefits: ["Pet hair removal", "Sofas & pet areas", "Pet beds", "Extra vacuuming"],
  /** Full scope for the pets step detail panel. */
  includes: [
    "Additional pet hair removal",
    "Sofas and pet areas",
    "Pet beds",
    "Baseboards",
    "Additional vacuuming passes",
    "Additional cleaning time",
  ],
} as const;

/** Full kitchen restoration — oven & fridge extras are included, not sold separately. */
export const KITCHEN_DEEP_RESET = {
  title: "Kitchen Deep Reset",
  summaryLabel: "Kitchen Deep Reset Included",
  fullScope: [
    "Degreasing kitchen surfaces",
    "Splashback cleaning",
    "Exterior appliance cleaning",
    "Range hood cleaning",
    "Cabinet fronts",
    "Sink & faucet detailing",
    "Interior oven cleaning",
    "Interior fridge cleaning",
    "Additional cleaning time",
    "Steam cleaner when needed",
  ],
} as const;

export const BATHROOM_DEEP_RESET = {
  title: "Bathroom Deep Reset",
  fullScope: [
    "Limescale treatment",
    "Steam cleaning",
    "Shower detailing",
    "Bathtub detailing",
    "Sink & faucet detailing",
    "Mirror cleaning",
    "Toilet deep clean",
    "Additional cleaning time",
  ],
} as const;

/** Hidden on the Extra care step when Kitchen Deep Reset is selected. */
export const ENHANCEMENTS_INCLUDED_IN_KITCHEN_DEEP_RESET: HomeResetEnhancement[] = [
  "oven_refresh",
  "fridge_refresh",
];

export const CUSTOMIZE_UPGRADE_OPTIONS: Array<{
  id: HomeResetUpgrade;
  title: string;
  benefits: string[];
  priceEur: number;
  description: string;
  priceLabel?: string;
  fullScope?: readonly string[];
}> = [
  {
    id: "standard_home_reset",
    title: "Standard Home Reset",
    description: "Complete premium refresh for your home.",
    benefits: ["Kitchen refresh", "Bathroom refresh", "Dust & floors", "Whole-home reset"],
    priceEur: HOME_RESET_UPGRADE_SURCHARGE_EUR.standard_home_reset,
    priceLabel: "Included",
  },
  {
    id: "bathroom_upgrade",
    title: BATHROOM_DEEP_RESET.title,
    description: "For bathrooms that need extra attention.",
    benefits: [
      "Limescale treatment",
      "Steam cleaning",
      "Shower detailing",
      "Extra cleaning time",
    ],
    priceEur: HOME_RESET_UPGRADE_SURCHARGE_EUR.bathroom_upgrade,
    priceLabel: "+39 €",
    fullScope: BATHROOM_DEEP_RESET.fullScope,
  },
  {
    id: "kitchen_upgrade",
    title: KITCHEN_DEEP_RESET.title,
    description: "Complete kitchen restoration.",
    benefits: ["Degreasing", "Oven included", "Fridge included", "Steam cleaning"],
    priceEur: HOME_RESET_UPGRADE_SURCHARGE_EUR.kitchen_upgrade,
    priceLabel: "+39 €",
    fullScope: KITCHEN_DEEP_RESET.fullScope,
  },
];

/** @deprecated Use CUSTOMIZE_UPGRADE_OPTIONS — kept for upgradeLabel lookups. */
export const UPGRADE_OPTIONS = CUSTOMIZE_UPGRADE_OPTIONS;

export const ENHANCEMENT_OPTIONS: Array<{
  id: HomeResetEnhancement;
  title: string;
  priceLabel?: string;
}> = [
  { id: "oven_refresh", title: "Inside Oven", priceLabel: "+€25" },
  { id: "fridge_refresh", title: "Inside Fridge", priceLabel: "+€20" },
  { id: "balcony_cleaning", title: "Balcony Cleaning", priceLabel: "+€20" },
];

export const SPECIAL_REQUEST_EXAMPLES = [
  "Apartment has not been cleaned for a long time",
  "Heavy limescale buildup",
  "Basement",
  "Garage",
  "Storage room",
  "Other custom requests",
] as const;

export const SPECIAL_REQUEST_GUIDANCE =
  "Home Reset is designed for homes in normal living condition. If your home requires post-renovation cleaning, removal of heavy limescale, or has unusually heavy buildup, please let us know so we can prepare the right team and equipment.";

/** Standard scope — shown on summary under “Included in your Home Reset”. */
export const HOME_RESET_INCLUDED_SECTIONS = STANDARD_HOME_RESET_SCOPE;

export const PETS_OPTIONS: Array<{
  id: import("./home-reset-wizard.types").HomeResetPetsOption;
  label: string;
}> = [
  { id: "no_pets", label: "No pets" },
  { id: "cat", label: "Cat" },
  { id: "dog", label: "Dog" },
  { id: "multiple", label: "Multiple pets" },
];

export const TIME_SLOTS = [
  { id: "09:00", label: "09:00 – 11:00" },
  { id: "11:00", label: "11:00 – 13:00" },
  { id: "13:00", label: "13:00 – 15:00" },
  { id: "15:00", label: "15:00 – 17:00" },
  { id: "17:00", label: "17:00 – 19:00" },
] as const;

export const HOME_RESET_IMAGES = {
  hero: "/wizard/wizard_main.png",
  livingRoom: "/wizard/step-2.png",
  summary: "https://images.unsplash.com/photo-1618221195710-dd6b41fa2426?w=1200&q=80",
  kitchen: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
} as const;

export const HOME_RESET_PET_STEP_IMAGES: Record<
  HomeResetPetsOption,
  { src: string; alt: string }
> = {
  no_pets: {
    src: "/wizard/step-3-4.png",
    alt: "Bright open-plan living room — CatClean Home Reset",
  },
  cat: {
    src: "/wizard/step-3-1.png",
    alt: "White cat on a sofa — CatClean Home Reset for pet homes",
  },
  dog: {
    src: "/wizard/step-3-2.png",
    alt: "White dog on a sofa — CatClean Home Reset for pet homes",
  },
  multiple: {
    src: "/wizard/step-3-3.png",
    alt: "Cat and dog together on a sofa — CatClean Home Reset for pet homes",
  },
};
