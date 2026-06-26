"use client";

import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { getTimeSlotLabel } from "@/i18n/public/schedule-i18n";
import { BookingCheckoutConfirm } from "@/components/booking/checkout";
import type { CheckoutDetailRow, CheckoutOverviewRow } from "@/components/booking/checkout";
import { HOME_RESET_IMAGES } from "../home-reset-wizard.constants";
import {
  getEnhancementOptions,
  getIncludedScopeSections,
  kitchenDeepResetSummaryLabel,
  bathroomDeepResetSummaryLabel,
  petHomeUpgradeSummaryLabel,
  translateHomeResetPets,
  translateHomeResetPropertyType,
} from "../home-reset-wizard.i18n";
import {
  getSelectedEnhancements,
  hasDeepUpgradesSelected,
  isBathroomDeepResetSelected,
  isKitchenDeepResetSelected,
  isPetHomeUpgradeIncluded,
  formatHomeResetPrice,
  formatSizeLabel,
} from "../home-reset-wizard.utils";
import type { HomeResetWizardState } from "../home-reset-wizard.types";

type Props = {
  state: HomeResetWizardState;
  estimatePrice: number | null;
};

function buildPackageLabel(
  state: HomeResetWizardState,
  t: ReturnType<typeof usePublicI18n>["t"],
): string {
  const base = t("public.homeReset.confirm.service");
  const parts = [base];

  if (isKitchenDeepResetSelected(state)) {
    parts.push(kitchenDeepResetSummaryLabel(t));
  }
  if (isBathroomDeepResetSelected(state)) {
    parts.push(bathroomDeepResetSummaryLabel(t));
  }
  if (!hasDeepUpgradesSelected(state)) {
    return base;
  }
  return parts.join(" · ");
}

export function StepConfirm({ state, estimatePrice }: Props) {
  const { t, locale } = usePublicI18n();
  const selectedExtras = getSelectedEnhancements(state);
  const enhancementTitles = new Map(
    getEnhancementOptions(t).map((item) => [item.id, item.title]),
  );
  const scopeSections = getIncludedScopeSections(t);
  const dateLocale = locale === "de" ? "de-DE" : "en-GB";

  const timeLabel = state.schedule.time
    ? getTimeSlotLabel(t, state.schedule.time)
    : "—";

  const formattedDate = state.schedule.date
    ? new Date(`${state.schedule.date}T12:00:00`).toLocaleDateString(dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  const overviewRows: CheckoutOverviewRow[] = [
    {
      id: "property",
      icon: "property",
      label: t("public.checkout.overview.property"),
      value: `${translateHomeResetPropertyType(t, state.propertyType)} · ${formatSizeLabel(state.propertySizeM2)}`,
    },
    {
      id: "pets",
      icon: "pets",
      label: t("public.checkout.overview.pets"),
      value: translateHomeResetPets(t, state.petsOption),
    },
    {
      id: "date",
      icon: "date",
      label: t("public.checkout.overview.date"),
      value: formattedDate,
    },
    {
      id: "time",
      icon: "time",
      label: t("public.checkout.overview.time"),
      value: timeLabel,
    },
    {
      id: "package",
      icon: "package",
      label: t("public.checkout.overview.package"),
      value: buildPackageLabel(state, t),
    },
  ];

  const detailRows: CheckoutDetailRow[] = [];

  if (isPetHomeUpgradeIncluded(state)) {
    detailRows.push({
      id: "pet-upgrade",
      label: t("public.homeReset.confirm.petUpgrade"),
      value: petHomeUpgradeSummaryLabel(t),
    });
  }

  for (const id of selectedExtras) {
    const title = enhancementTitles.get(id);
    if (title) {
      detailRows.push({
        id: `extra-${id}`,
        label: t("public.homeReset.confirm.extraCare"),
        value: title,
      });
    }
  }

  if (state.specialRequest.trim()) {
    detailRows.push({
      id: "special",
      label: t("public.homeReset.confirm.specialRequests"),
      value: state.specialRequest.trim(),
    });
  }

  return (
    <BookingCheckoutConfirm
      overviewRows={overviewRows}
      scopeSections={scopeSections}
      detailRows={detailRows}
      price={formatHomeResetPrice(estimatePrice)}
      isEstimate
      imageSrc={HOME_RESET_IMAGES.summary}
      footerNote={t("public.homeReset.confirm.footer")}
    />
  );
}
