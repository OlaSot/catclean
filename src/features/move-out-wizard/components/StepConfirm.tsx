"use client";

import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { getTimeSlotLabel } from "@/i18n/public/schedule-i18n";
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-100 py-3 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-slate-700">{value}</span>
    </div>
  );
}

export function StepConfirm({ state, estimatePrice }: Props) {
  const { t, locale } = usePublicI18n();
  const dateLocale = locale === "de" ? "de-DE" : "en-GB";

  const formattedDate = state.schedule.date
    ? new Date(`${state.schedule.date}T12:00:00`).toLocaleDateString(dateLocale, {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "—";

  const timeLabel = state.schedule.time
    ? getTimeSlotLabel(t, state.schedule.time)
    : "—";

  const extrasLabels = getActiveExtras(state)
    .map((id) => translateExtra(t, id).title)
    .join(", ");

  const visitSummary = [
    state.visitNotes.accessNotes.trim(),
    state.visitNotes.petsInfo.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  const addressLine = [
    state.address.street,
    state.address.houseNumber,
    state.address.apartment,
    state.address.zip,
    state.address.city,
  ]
    .filter((part) => part.trim())
    .join(", ");

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.moveOut.summary.eyebrow")}
        title={t("public.moveOut.summary.title")}
        subtitle={t("public.moveOut.summary.subtitle")}
      />

      <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6">
        {state.package ? (
          <Row label={t("public.moveOut.summary.package")} value={translatePackage(t, state.package)} />
        ) : null}
        <Row label={t("public.moveOut.summary.size")} value={formatSizeLabel(state.propertySizeM2)} />
        <Row
          label={t("public.moveOut.summary.extras")}
          value={extrasLabels || t("public.moveOut.summary.none")}
        />
        {visitSummary ? (
          <Row label={t("public.moveOut.summary.visit")} value={visitSummary} />
        ) : null}
        <Row label={t("public.moveOut.summary.address")} value={addressLine || "—"} />
        <Row
          label={t("public.moveOut.summary.schedule")}
          value={`${formattedDate} · ${timeLabel}`}
        />
        <Row label={t("public.moveOut.summary.contact")} value={state.contact.name || "—"} />
        <Row
          label={t("public.moveOut.summary.price")}
          value={formatMoveOutPrice(estimatePrice)}
        />
      </div>

      <div className="rounded-3xl border border-amber-100 bg-amber-50/60 px-5 py-4">
        <p className="text-sm font-semibold text-amber-900">
          {t("public.moveOut.summary.notIncludedTitle")}
        </p>
        <p className="mt-1 text-sm text-amber-800/90">{t("public.moveOut.summary.notIncludedBody")}</p>
      </div>
    </div>
  );
}
