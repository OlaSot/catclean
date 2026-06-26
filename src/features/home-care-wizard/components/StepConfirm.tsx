"use client";

import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { getTimeSlotLabel } from "@/i18n/public/schedule-i18n";
import { BookingCheckoutConfirm } from "@/components/booking/checkout";
import type { CheckoutDetailRow, CheckoutOverviewRow } from "@/components/booking/checkout";
import {
  getHomeCareIncludedSections,
  getHomeCareNotIncludedItems,
} from "../home-care-scope.i18n";
import {
  translateEnhancement,
  translateFrequency,
  translatePets,
  translatePropertyType,
} from "../home-care-wizard.i18n";
import {
  formatHomeCarePrice,
  formatSizeLabel,
  getSelectedEnhancements,
} from "../home-care-wizard.utils";
import type { HomeCareWizardState } from "../home-care-wizard.types";

type Props = {
  state: HomeCareWizardState;
  estimatePrice: number | null;
};

export function StepConfirm({ state, estimatePrice }: Props) {
  const { t, locale } = usePublicI18n();
  const extras =
    getSelectedEnhancements(state)
      .map((id) => translateEnhancement(t, id))
      .join(", ") || "";
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
      value: `${translatePropertyType(t, state.propertyType)} · ${formatSizeLabel(state.propertySizeM2)}`,
    },
    {
      id: "pets",
      icon: "pets",
      label: t("public.checkout.overview.pets"),
      value: translatePets(t, state.petsOption),
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
      value: timeLabel || "—",
    },
    {
      id: "package",
      icon: "package",
      label: t("public.checkout.overview.package"),
      value: t("public.booking.homeCare"),
    },
  ];

  const detailRows: CheckoutDetailRow[] = [
    {
      id: "frequency",
      label: t("public.homeCare.summary.frequency"),
      value: translateFrequency(t, state.frequency),
    },
  ];

  if (extras) {
    detailRows.push({
      id: "extras",
      label: t("public.homeCare.summary.extras"),
      value: extras,
    });
  }

  const notIncluded = getHomeCareNotIncludedItems(t);

  return (
    <BookingCheckoutConfirm
      overviewRows={overviewRows}
      scopeSections={getHomeCareIncludedSections(t)}
      detailRows={detailRows}
      price={formatHomeCarePrice(estimatePrice)}
      isEstimate
      imageSrc="/wizard/step-2.png"
      footerNote={t("public.homeCare.confirm.footer")}
      extraContent={
        notIncluded.length > 0 ? (
          <section className="checkout-card-hover rounded-3xl border border-stone-200/80 bg-stone-50/60 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-800">
              {t("public.homeCare.confirm.notIncluded.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("public.homeCare.confirm.notIncluded.subtitle")}
            </p>
            <ul className="mt-3 space-y-1.5">
              {notIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-slate-400" aria-hidden>
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null
      }
    />
  );
}
