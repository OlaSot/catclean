import type { PublicTranslateFn } from "@/i18n/public/public-i18n.types";
import type {
  HomeCareEnhancement,
  HomeCareFrequency,
  HomeCarePetsOption,
} from "./home-care-wizard.types";

const FREQ_KEYS: Record<HomeCareFrequency, string> = {
  one_time: "public.homeCare.freq.oneTime",
  weekly: "public.homeCare.freq.weekly",
  biweekly: "public.homeCare.freq.biweekly",
  monthly: "public.homeCare.freq.monthly",
};

const PETS_KEYS: Record<HomeCarePetsOption, string> = {
  no_pets: "public.homeCare.pets.no",
  cat: "public.homeCare.pets.cat",
  dog: "public.homeCare.pets.dog",
  multiple: "public.homeCare.pets.multiple",
};

const EXTRA_KEYS: Record<HomeCareEnhancement, string> = {
  oven_refresh: "public.homeCare.extra.oven",
  fridge_refresh: "public.homeCare.extra.fridge",
  inside_cabinets: "public.homeCare.extra.cabinets",
  balcony_cleaning: "public.homeCare.extra.balcony",
  window_cleaning: "public.homeCare.extra.windows",
};

export function translateFrequency(t: PublicTranslateFn, frequency: HomeCareFrequency): string {
  return t(FREQ_KEYS[frequency]);
}

export function translatePets(t: PublicTranslateFn, option: HomeCarePetsOption): string {
  return t(PETS_KEYS[option]);
}

export function translatePropertyType(
  t: PublicTranslateFn,
  type: "apartment" | "house" | null
): string {
  if (type === "apartment") return t("public.homeCare.apartment");
  if (type === "house") return t("public.homeCare.house");
  return "—";
}

export function translateEnhancement(t: PublicTranslateFn, id: HomeCareEnhancement): string {
  return t(EXTRA_KEYS[id]);
}
