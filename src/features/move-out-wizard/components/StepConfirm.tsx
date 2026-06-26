"use client";

import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { getTimeSlotLabel } from "@/i18n/public/schedule-i18n";
import { BookingCheckoutConfirm } from "@/components/booking/checkout";
import type { CheckoutDetailRow, CheckoutOverviewRow } from "@/components/booking/checkout";
import { translateExtra, translatePackage } from "../move-out-wizard.i18n";
import type { MoveOutWizardState } from "../move-out-wizard.types";
import {
  formatMoveOutPrice,
  formatSizeLabel,
  getActiveExtras,
} from "../move-out-wizard.utils";

type Props = {
  state: MoveOutWizardState;
  estimatePrice: number | null;
};

export function StepConfirm({ state, estimatePrice }: Props) {
  const { t, locale } = usePublicI18n();
  const dateLocale = locale === "de" ? "de-DE" : "en-GB";

  const formattedDate = state.schedule.date
    ? new Date(`${state.schedule.date}T12:00:00`).toLocaleDateString(dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  const timeLabel = state.schedule.time
    ? getTimeSlotLabel(t, state.schedule.time)
    : "—";

  const extrasLabels = getActiveExtras(state)
    .map((id) => translateExtra(t, id).title)
    .join(", ");

  const addressLine = [
    state.address.street,
    state.address.houseNumber,
    state.address.apartment,
    state.address.zip,
    state.address.city,
  ]
    .filter((part) => part.trim())
    .join(", ");

  const visitSummary = [
    state.visitNotes.accessNotes.trim(),
    state.visitNotes.petsInfo.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  const overviewRows: CheckoutOverviewRow[] = [
    {
      id: "property",
      icon: "property",
      label: t("public.checkout.overview.property"),
      value: formatSizeLabel(state.propertySizeM2),
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
      value: state.package ? translatePackage(t, state.package) : t("public.booking.moveOut"),
    },
  ];

  const detailRows: CheckoutDetailRow[] = [];

  if (extrasLabels) {
    detailRows.push({
      id: "extras",
      label: t("public.moveOut.summary.extras"),
      value: extrasLabels,
    });
  }

  if (visitSummary) {
    detailRows.push({
      id: "visit",
      label: t("public.moveOut.summary.visit"),
      value: visitSummary,
    });
  }

  if (addressLine) {
    detailRows.push({
      id: "address",
      label: t("public.checkout.overview.address"),
      value: addressLine,
    });
  }

  if (state.contact.name.trim()) {
    detailRows.push({
      id: "contact",
      label: t("public.checkout.overview.contact"),
      value: state.contact.name.trim(),
    });
  }

  return (
    <BookingCheckoutConfirm
      overviewRows={overviewRows}
      detailRows={detailRows}
      price={formatMoveOutPrice(estimatePrice)}
      isEstimate
      imageSrc="/wizard/wizard_main.png"
      extraContent={
        <section className="rounded-3xl border border-amber-100/90 bg-amber-50/70 px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-amber-900">
            {t("public.moveOut.summary.notIncludedTitle")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-amber-800/90">
            {t("public.moveOut.summary.notIncludedBody")}
          </p>
        </section>
      }
    />
  );
}
