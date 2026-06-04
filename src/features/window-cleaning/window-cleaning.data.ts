import type { WindowItem } from "./window-cleaning.types";

export const WINDOW_CLEANING_PLACEHOLDER_IMAGE = "/images/upholstery-placeholder.jpg";

/** Photos in public/windows/ — add xl-window.png and door images when ready */
const IMG = {
  windowS: "/windows/s-window.png",
  windowM: "/windows/m-window.png",
  windowL: "/windows/l-window.png",
} as const;

export const WINDOW_ITEMS: WindowItem[] = [
  {
    id: "window_s",
    kind: "window",
    title: "S Window",
    subtitle: "Bathroom / Kitchen Window",
    sizeDescription: "Up to 0.8 m²",
    sizeBadge: "S",
    sizeFrame: "s",
    priceFrom: 5,
    durationMinutes: 15,
    imageSrc: IMG.windowS,
  },
  {
    id: "window_m",
    kind: "window",
    title: "M Window",
    subtitle: "Standard Room Window",
    sizeDescription: "0.8–2 m²",
    sizeBadge: "M",
    sizeFrame: "m",
    priceFrom: 10,
    durationMinutes: 20,
    imageSrc: IMG.windowM,
  },
  {
    id: "window_l",
    kind: "window",
    title: "L Window",
    subtitle: "Large Living Room Window",
    sizeDescription: "2–4 m²",
    sizeBadge: "L",
    sizeFrame: "l",
    priceFrom: 18,
    durationMinutes: 30,
    imageSrc: IMG.windowL,
  },
  {
    id: "window_xl",
    kind: "window",
    title: "XL Window",
    subtitle: "Panoramic Window",
    sizeDescription: "4+ m²",
    sizeBadge: "XL",
    sizeFrame: "xl",
    priceFrom: 25,
    durationMinutes: 40,
  },
];

export const DOOR_ITEMS: WindowItem[] = [
  {
    id: "balcony_door",
    kind: "door",
    title: "Balcony Door",
    subtitle: "Window + balcony access",
    priceFrom: 15,
    durationMinutes: 25,
  },
  {
    id: "sliding_terrace_door",
    kind: "door",
    title: "Sliding Terrace Door",
    subtitle: "Large sliding glass panel",
    priceFrom: 20,
    durationMinutes: 30,
  },
  {
    id: "double_glass_door",
    kind: "door",
    title: "Double Glass Door",
    subtitle: "French / double-leaf doors",
    priceFrom: 22,
    durationMinutes: 32,
  },
  {
    id: "commercial_entrance_door",
    kind: "door",
    title: "Commercial Entrance Door",
    subtitle: "Office or shop front",
    priceFrom: 25,
    durationMinutes: 35,
  },
];

export const ALL_WINDOW_CLEANING_ITEMS: WindowItem[] = [...WINDOW_ITEMS, ...DOOR_ITEMS];

export const WINDOW_ACCESS_OPTIONS = [
  { id: "easy" as const, label: "Easy access" },
  { id: "ladder" as const, label: "Ladder required" },
  { id: "difficult" as const, label: "Difficult access" },
];

export const WINDOW_EXTRA_ITEMS = [
  { id: "blinds" as const, label: "Blinds cleaning", priceFrom: 12, durationMinutes: 20 },
  { id: "shutters" as const, label: "Shutters cleaning", priceFrom: 15, durationMinutes: 25 },
  { id: "frame_deep" as const, label: "Window frame deep cleaning", priceFrom: 10, durationMinutes: 15 },
  { id: "water_stains" as const, label: "Water stain removal", priceFrom: 8, durationMinutes: 15 },
  { id: "after_renovation" as const, label: "After renovation cleaning", priceFrom: 20, durationMinutes: 30 },
] as const;

export const EMPTY_WINDOW_EXTRAS = {
  blinds: false,
  shutters: false,
  frame_deep: false,
  water_stains: false,
  after_renovation: false,
};

export const WINDOW_CLEANING_SERVICE = {
  name: "Window Cleaning",
  title: "What needs cleaning?",
  subtitle: "Choose the windows that best match your home.",
  infoTitle: "Not sure which size to choose?",
  infoText:
    "Upload a photo later and our team will verify everything before the appointment.",
};
