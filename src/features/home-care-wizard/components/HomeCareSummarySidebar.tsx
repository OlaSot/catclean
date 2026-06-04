"use client";

import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import {
  translateFrequency,
  translatePets,
  translatePropertyType,
} from "../home-care-wizard.i18n";
import { translateEnhancement } from "../home-care-wizard.i18n";
import {
  formatHomeCareDuration,
  formatHomeCarePrice,
  formatSizeLabel,
  getSelectedEnhancements,
} from "../home-care-wizard.utils";
import { getTimeSlotLabel } from "@/i18n/public/schedule-i18n";
import { TIME_SLOTS } from "../home-care-wizard.constants";
import type { HomeCareWizardState } from "../home-care-wizard.types";

type Props = {
  state: HomeCareWizardState;
  estimatePrice: number | null;
  estimateDurationMinutes: number | null;
  className?: string;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-700">{value}</dd>
    </div>
  );
}

export function HomeCareSummarySidebar({
  state,
  estimatePrice,
  estimateDurationMinutes,
  className = "",
}: Props) {
  const { t, locale } = usePublicI18n();
  const dateLocale = locale === "de" ? "de-DE" : "en-GB";

  const formattedDate = state.schedule.date
    ? new Date(`${state.schedule.date}T12:00:00`).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;

  const timeLabel = state.schedule.time ? getTimeSlotLabel(t, state.schedule.time) : null;

  const extras = getSelectedEnhancements(state)
    .map((id) => translateEnhancement(t, id))
    .join(", ");

  return (
    <aside
      className={`rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)] sm:p-6 ${className}`.trim()}
    >
      <h2 className="text-lg font-semibold text-slate-800">{t("public.homeCare.sidebar.title")}</h2>
      <p className="mt-1 text-sm text-slate-400">{t("public.homeCare.sidebar.live")}</p>

      <dl className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm">
        <SummaryRow label={t("public.homeCare.summary.service")} value={t("public.booking.homeCare")} />
        <SummaryRow
          label={t("public.homeCare.summary.frequency")}
          value={translateFrequency(t, state.frequency)}
        />
        {state.propertyType ? (
          <SummaryRow
            label={t("public.homeCare.summary.home")}
            value={translatePropertyType(t, state.propertyType)}
          />
        ) : null}
        {state.propertySizeM2 ? (
          <SummaryRow label={t("public.homeCare.sidebar.size")} value={formatSizeLabel(state.propertySizeM2)} />
        ) : null}
        <SummaryRow label={t("public.homeCare.summary.pets")} value={translatePets(t, state.petsOption)} />
        {extras ? <SummaryRow label={t("public.homeCare.summary.extras")} value={extras} /> : null}
        {formattedDate ? (
          <SummaryRow
            label={t("public.homeCare.summary.date")}
            value={`${formattedDate}${timeLabel ? ` · ${timeLabel}` : ""}`}
          />
        ) : null}
      </dl>

      <div className="mt-6 rounded-2xl border border-[#34597E]/15 bg-[#34597E]/[0.04] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#34597E]">
          {formatHomeCarePrice(estimatePrice)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatHomeCareDuration(estimateDurationMinutes)}
        </p>
      </div>
    </aside>
  );
}
