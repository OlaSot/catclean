import type { PublicTranslateFn } from "@/i18n/public/public-i18n.types";
import type { LucideIcon } from "lucide-react";
import { CalendarOff, Droplets, PawPrint, Sparkles } from "lucide-react";
import { HOME_RESET_UPGRADE_SURCHARGE_EUR } from "@/lib/orders/home-reset-upgrade";
import type {
  HomeResetEnhancement,
  HomeResetPetsOption,
  HomeResetPropertyType,
  HomeResetUpgrade,
} from "./home-reset-wizard.types";

const PETS_KEYS: Record<HomeResetPetsOption, string> = {
  no_pets: "public.homeCare.pets.no",
  cat: "public.homeCare.pets.cat",
  dog: "public.homeCare.pets.dog",
  multiple: "public.homeCare.pets.multiple",
};

const ENHANCEMENT_KEYS: Record<HomeResetEnhancement, { title: string; price?: string }> = {
  oven_refresh: {
    title: "public.homeReset.enhancements.oven",
    price: "public.homeReset.enhancements.ovenPrice",
  },
  fridge_refresh: {
    title: "public.homeReset.enhancements.fridge",
    price: "public.homeReset.enhancements.fridgePrice",
  },
  balcony_cleaning: {
    title: "public.homeReset.enhancements.balcony",
    price: "public.homeReset.enhancements.balconyPrice",
  },
};

export function translateHomeResetPets(t: PublicTranslateFn, option: HomeResetPetsOption): string {
  return t(PETS_KEYS[option]);
}

export function translateHomeResetPropertyType(
  t: PublicTranslateFn,
  type: HomeResetPropertyType | null
): string {
  if (type === "apartment") return t("public.homeCare.apartment");
  if (type === "house") return t("public.homeCare.house");
  return "—";
}

export function translateHomeResetUpgrade(t: PublicTranslateFn, upgrade: HomeResetUpgrade): string {
  if (upgrade === "standard_home_reset") return t("public.homeReset.customize.standard.title");
  if (upgrade === "bathroom_upgrade") return t("public.homeReset.customize.bathroom.title");
  return t("public.homeReset.customize.kitchen.title");
}

export function kitchenDeepResetSummaryLabel(t: PublicTranslateFn): string {
  return t("public.homeReset.customize.kitchen.summaryLabel");
}

export function petHomeUpgradeSummaryLabel(t: PublicTranslateFn): string {
  return t("public.homeReset.pets.upgrade.summaryLabel");
}

export function getWelcomeBenefits(t: PublicTranslateFn): Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> {
  return [
    { title: t("public.homeReset.welcome.benefit1.title"), description: t("public.homeReset.welcome.benefit1.desc"), icon: Sparkles },
    { title: t("public.homeReset.welcome.benefit2.title"), description: t("public.homeReset.welcome.benefit2.desc"), icon: PawPrint },
    { title: t("public.homeReset.welcome.benefit3.title"), description: t("public.homeReset.welcome.benefit3.desc"), icon: Droplets },
    { title: t("public.homeReset.welcome.benefit4.title"), description: t("public.homeReset.welcome.benefit4.desc"), icon: CalendarOff },
  ];
}

const PET_IMAGE_ALT_KEYS: Record<HomeResetPetsOption, string> = {
  no_pets: "public.homeReset.pets.image.noPets",
  cat: "public.homeReset.pets.image.cat",
  dog: "public.homeReset.pets.image.dog",
  multiple: "public.homeReset.pets.image.multiple",
};

export function getPetStepImageAlt(t: PublicTranslateFn, option: HomeResetPetsOption): string {
  return t(PET_IMAGE_ALT_KEYS[option]);
}

export function getCustomizeUpgradeOptions(t: PublicTranslateFn) {
  const upgrades: Array<{
    id: HomeResetUpgrade;
    title: string;
    description: string;
    benefits: string[];
    priceEur: number;
    priceLabel?: string;
    fullScope?: string[];
  }> = [
    {
      id: "standard_home_reset",
      title: t("public.homeReset.customize.standard.title"),
      description: t("public.homeReset.customize.standard.description"),
      benefits: [
        t("public.homeReset.customize.standard.benefit1"),
        t("public.homeReset.customize.standard.benefit2"),
        t("public.homeReset.customize.standard.benefit3"),
        t("public.homeReset.customize.standard.benefit4"),
      ],
      priceEur: HOME_RESET_UPGRADE_SURCHARGE_EUR.standard_home_reset,
      priceLabel: t("public.homeReset.customize.standard.priceLabel"),
    },
    {
      id: "bathroom_upgrade",
      title: t("public.homeReset.customize.bathroom.title"),
      description: t("public.homeReset.customize.bathroom.description"),
      benefits: [
        t("public.homeReset.customize.bathroom.benefit1"),
        t("public.homeReset.customize.bathroom.benefit2"),
        t("public.homeReset.customize.bathroom.benefit3"),
        t("public.homeReset.customize.bathroom.benefit4"),
      ],
      priceEur: HOME_RESET_UPGRADE_SURCHARGE_EUR.bathroom_upgrade,
      priceLabel: t("public.homeReset.customize.bathroom.priceLabel"),
      fullScope: Array.from({ length: 8 }, (_, i) =>
        t(`public.homeReset.customize.bathroom.scope${i + 1}`)
      ),
    },
    {
      id: "kitchen_upgrade",
      title: t("public.homeReset.customize.kitchen.title"),
      description: t("public.homeReset.customize.kitchen.description"),
      benefits: [
        t("public.homeReset.customize.kitchen.benefit1"),
        t("public.homeReset.customize.kitchen.benefit2"),
        t("public.homeReset.customize.kitchen.benefit3"),
        t("public.homeReset.customize.kitchen.benefit4"),
      ],
      priceEur: HOME_RESET_UPGRADE_SURCHARGE_EUR.kitchen_upgrade,
      priceLabel: t("public.homeReset.customize.kitchen.priceLabel"),
      fullScope: Array.from({ length: 10 }, (_, i) =>
        t(`public.homeReset.customize.kitchen.scope${i + 1}`)
      ),
    },
  ];
  return upgrades;
}

export function getEnhancementOptions(t: PublicTranslateFn) {
  return (["oven_refresh", "fridge_refresh", "balcony_cleaning"] as HomeResetEnhancement[]).map(
    (id) => ({
      id,
      title: t(ENHANCEMENT_KEYS[id].title),
      priceLabel: ENHANCEMENT_KEYS[id].price ? t(ENHANCEMENT_KEYS[id].price!) : undefined,
    })
  );
}

export function getSpecialRequestExamples(t: PublicTranslateFn): string[] {
  return Array.from({ length: 6 }, (_, i) => t(`public.homeReset.requests.example${i + 1}`));
}

export function getIncludedScopeSections(t: PublicTranslateFn) {
  const sections = [
    { key: "kitchen", itemCount: 6 },
    { key: "bathroom", itemCount: 7 },
    { key: "living", itemCount: 4 },
    { key: "entire", itemCount: 3 },
  ] as const;

  return sections.map(({ key, itemCount }) => ({
    title: t(`public.homeReset.confirm.scope.${key}.title`),
    items: Array.from({ length: itemCount }, (_, i) =>
      t(`public.homeReset.confirm.scope.${key}.item${i + 1}`)
    ),
  }));
}

export function getPetHomeUpgradeCard(t: PublicTranslateFn) {
  return {
    title: t("public.homeReset.pets.upgrade.title"),
    cardDescription: t("public.homeReset.pets.upgrade.cardDescription"),
    includedBadge: t("public.homeReset.pets.upgrade.includedBadge"),
    cardBenefits: [
      t("public.homeReset.pets.upgrade.cardBenefit1"),
      t("public.homeReset.pets.upgrade.cardBenefit2"),
      t("public.homeReset.pets.upgrade.cardBenefit3"),
      t("public.homeReset.pets.upgrade.cardBenefit4"),
    ],
    petsStepTitle: t("public.homeReset.pets.upgrade.petsStepTitle"),
    petsStepIntro: t("public.homeReset.pets.upgrade.petsStepIntro"),
    petsStepBullets: [
      t("public.homeReset.pets.upgrade.bullet1"),
      t("public.homeReset.pets.upgrade.bullet2"),
      t("public.homeReset.pets.upgrade.bullet3"),
      t("public.homeReset.pets.upgrade.bullet4"),
    ],
  };
}
