"use client";

import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { BookingCheckoutConfirm } from "@/components/booking/checkout";
import type { CheckoutDetailRow, CheckoutOverviewRow } from "@/components/booking/checkout";
import { WINDOW_ACCESS_OPTIONS, WINDOW_EXTRA_ITEMS } from "../window-cleaning.data";
import type { WindowCleaningWizardState } from "../window-cleaning.types";
import {
  formatWindowDuration,
  formatWindowPrice,
  getSelectedWindowItems,
} from "../window-cleaning.utils";

type Props = {
  state: WindowCleaningWizardState;
  estimatePrice: number;
  estimateDurationMinutes: number;
};

export function StepWindowSummary({ state, estimatePrice, estimateDurationMinutes }: Props) {
  const { t } = usePublicI18n();
  const selectedItems = getSelectedWindowItems(state.quantities);
  const selectedExtras = WINDOW_EXTRA_ITEMS.filter((extra) => state.extras[extra.id]);
  const accessLabel =
    WINDOW_ACCESS_OPTIONS.find((option) => option.id === state.details.access)?.label ?? "—";

  const formattedDate = state.schedule.date
    ? new Date(`${state.schedule.date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  const overviewRows: CheckoutOverviewRow[] = [
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
      value: state.schedule.time || "—",
    },
    {
      id: "package",
      icon: "package",
      label: t("public.checkout.overview.package"),
      value: t("public.booking.service.window.title"),
    },
  ];

  const detailRows: CheckoutDetailRow[] = [
    {
      id: "items",
      label: "Selected items",
      value:
        selectedItems.length > 0
          ? selectedItems.map(({ item, quantity }) => `${item.title} × ${quantity}`).join(", ")
          : "—",
    },
    {
      id: "access",
      label: "Access",
      value: accessLabel,
    },
    {
      id: "inside",
      label: "Inside only",
      value:
        state.details.insideOnly == null
          ? "—"
          : state.details.insideOnly
            ? t("public.common.yes")
            : t("public.common.no"),
    },
    {
      id: "outside",
      label: "Outside required",
      value:
        state.details.outsideRequired == null
          ? "—"
          : state.details.outsideRequired
            ? t("public.common.yes")
            : t("public.common.no"),
    },
    {
      id: "extras",
      label: "Extras",
      value:
        selectedExtras.length > 0
          ? selectedExtras.map((extra) => extra.label).join(", ")
          : t("public.homeCare.summary.none"),
    },
    {
      id: "address",
      label: t("public.checkout.overview.address"),
      value: `${state.address.street} ${state.address.houseNumber}, ${state.address.city}`.trim(),
    },
    {
      id: "contact",
      label: t("public.checkout.overview.contact"),
      value: `${state.contact.name} (${state.contact.phone})`,
    },
    {
      id: "duration",
      label: "Estimated duration",
      value: formatWindowDuration(estimateDurationMinutes),
    },
  ];

  return (
    <BookingCheckoutConfirm
      overviewRows={overviewRows}
      detailRows={detailRows}
      price={formatWindowPrice(estimatePrice)}
      isEstimate
      imageSrc="/windows/m-window.png"
    />
  );
}
