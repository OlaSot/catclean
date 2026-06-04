import type { PublicTranslateFn } from "@/i18n/public/public-i18n.types";
import type { MoveOutProgressStepId } from "./move-out-wizard.constants";
import type { ComparisonRow, MoveOutPackageCardContent } from "./move-out-wizard.constants";
import type { ApartmentCondition, MoveOutExtras, MoveOutPackage } from "./move-out-wizard.types";

export function translateProgressStep(t: PublicTranslateFn, stepId: MoveOutProgressStepId): string {
  return t(`public.moveOut.step.${stepId}`);
}

export function translatePackage(t: PublicTranslateFn, pkg: MoveOutPackage): string {
  return pkg === "premium"
    ? t("public.moveOut.premium.title")
    : t("public.moveOut.standard.title");
}

export function translateExtra(
  t: PublicTranslateFn,
  id: keyof MoveOutExtras
): { title: string; description: string } {
  return {
    title: t(`public.moveOut.extra.${id}.title`),
    description: t(`public.moveOut.extra.${id}.description`),
  };
}

export function getMoveOutPackageCards(t: PublicTranslateFn): MoveOutPackageCardContent[] {
  return [
    {
      id: "standard",
      title: t("public.moveOut.standard.title"),
      badge: t("public.moveOut.standard.badge"),
      headline: t("public.moveOut.standard.headline"),
      highlights: [
        t("public.moveOut.standard.h1"),
        t("public.moveOut.standard.h2"),
        t("public.moveOut.standard.h3"),
      ],
      checklist: [
        t("public.moveOut.standard.c1"),
        t("public.moveOut.standard.c2"),
        t("public.moveOut.standard.c3"),
        t("public.moveOut.standard.c4"),
        t("public.moveOut.standard.c5"),
      ],
    },
    {
      id: "premium",
      title: t("public.moveOut.premium.title"),
      headline: t("public.moveOut.premium.headline"),
      highlights: [
        t("public.moveOut.premium.h1"),
        t("public.moveOut.premium.h2"),
        t("public.moveOut.premium.h3"),
        t("public.moveOut.premium.h4"),
      ],
      checklist: [
        t("public.moveOut.premium.c1"),
        t("public.moveOut.premium.c2"),
        t("public.moveOut.premium.c3"),
        t("public.moveOut.premium.c4"),
        t("public.moveOut.premium.c5"),
      ],
    },
  ];
}

export function getApartmentConditionOptions(t: PublicTranslateFn): Array<{
  id: ApartmentCondition;
  label: string;
  description: string;
  suggestedPackage: MoveOutPackage | null;
}> {
  return [
    {
      id: "well_maintained",
      label: t("public.moveOut.condition.wellMaintained"),
      description: t("public.moveOut.condition.wellMaintainedDesc"),
      suggestedPackage: "standard",
    },
    {
      id: "normal_wear",
      label: t("public.moveOut.condition.normal"),
      description: t("public.moveOut.condition.normalDesc"),
      suggestedPackage: "standard",
    },
    {
      id: "heavy_grease_limescale",
      label: t("public.moveOut.condition.heavy"),
      description: t("public.moveOut.condition.heavyDesc"),
      suggestedPackage: "premium",
    },
    {
      id: "not_sure",
      label: t("public.moveOut.condition.unsure"),
      description: t("public.moveOut.condition.unsureDesc"),
      suggestedPackage: null,
    },
  ];
}

export function getPackageComparisonRows(t: PublicTranslateFn): ComparisonRow[] {
  return [
    {
      feature: t("public.moveOut.compare.bestFor"),
      standard: t("public.moveOut.compare.bestForStandard"),
      premium: t("public.moveOut.compare.bestForPremium"),
      highlight: true,
    },
    {
      feature: t("public.moveOut.compare.goal"),
      standard: t("public.moveOut.compare.goalStandard"),
      premium: t("public.moveOut.compare.goalPremium"),
    },
    {
      feature: t("public.moveOut.compare.living"),
      standard: t("public.moveOut.compare.livingStandard"),
      premium: t("public.moveOut.compare.livingPremium"),
    },
    {
      feature: t("public.moveOut.compare.kitchen"),
      standard: t("public.moveOut.compare.kitchenStandard"),
      premium: t("public.moveOut.compare.kitchenPremium"),
    },
    {
      feature: t("public.moveOut.compare.bathroom"),
      standard: t("public.moveOut.compare.bathroomStandard"),
      premium: t("public.moveOut.compare.bathroomPremium"),
    },
    {
      feature: t("public.moveOut.compare.appliances"),
      standard: t("public.moveOut.compare.appliancesBoth"),
      premium: t("public.moveOut.compare.appliancesBoth"),
    },
    {
      feature: t("public.moveOut.compare.notIncluded"),
      standard: t("public.moveOut.compare.notIncludedBoth"),
      premium: t("public.moveOut.compare.notIncludedBoth"),
      highlight: true,
    },
  ];
}
