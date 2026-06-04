"use client";

import { WizardStepHeader } from "@/features/home-reset-wizard/components/WizardStepHeader";
import { getTimeSlotLabel } from "@/i18n/public/schedule-i18n";
import {
  getHomeCareIncludedSections,
  getHomeCareNotIncludedItems,
} from "../home-care-scope.i18n";
import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
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

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-100 py-3.5 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function StepConfirm({ state, estimatePrice }: Props) {
  const { t, locale } = usePublicI18n();
  const extras =
    getSelectedEnhancements(state)
      .map((id) => translateEnhancement(t, id))
      .join(", ") || "";
  const dateLocale = locale === "de" ? "de-DE" : "en-GB";
  const timeLabel = state.schedule.time
    ? getTimeSlotLabel(t, state.schedule.time)
    : state.schedule.time;

  const formattedDate = state.schedule.date
    ? new Date(`${state.schedule.date}T12:00:00`).toLocaleDateString(dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "—";

  return (
    <div className="space-y-8">
      <WizardStepHeader
        eyebrow={t("public.homeCare.summary.eyebrow")}
        title={t("public.homeCare.summary.title")}
        subtitle={t("public.homeCare.summary.subtitle")}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6">
          <h2 className="text-base font-semibold text-slate-800">{t("public.homeCare.confirm.bookingTitle")}</h2>
          <div className="mt-4">
            <SummaryItem label={t("public.homeCare.summary.service")} value={t("public.booking.homeCare")} />
            <SummaryItem
              label={t("public.homeCare.summary.frequency")}
              value={translateFrequency(t, state.frequency)}
            />
            <SummaryItem
              label={t("public.homeCare.summary.home")}
              value={`${translatePropertyType(t, state.propertyType)} · ${formatSizeLabel(state.propertySizeM2)}`}
            />
            <SummaryItem label={t("public.homeCare.summary.pets")} value={translatePets(t, state.petsOption)} />
            <SummaryItem
              label={t("public.homeCare.summary.extras")}
              value={extras || t("public.homeCare.summary.none")}
            />
            <SummaryItem label={t("public.homeCare.summary.date")} value={formattedDate} />
            <SummaryItem label={t("public.homeCare.summary.time")} value={timeLabel || "—"} />
          </div>
          <div className="mt-5 flex items-baseline justify-between rounded-2xl border border-[#34597E]/15 bg-[#34597E]/[0.04] px-4 py-4">
            <span className="text-sm font-medium text-slate-600">{t("public.homeCare.confirm.estimatedPrice")}</span>
            <span className="text-2xl font-semibold text-[#34597E]">
              {formatHomeCarePrice(estimatePrice)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-stone-200/80 bg-stone-50/80 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-800">{t("public.homeCare.confirm.included.title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("public.homeCare.confirm.included.subtitle")}</p>
            <div className="mt-4 space-y-4">
              {getHomeCareIncludedSections(t).map((section) => (
                <div key={section.title}>
                  <p className="text-xs font-semibold tracking-wide text-[#34597E] uppercase">
                    {section.title}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-[#5B8DB8]" aria-hidden>
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-800">{t("public.homeCare.confirm.notIncluded.title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("public.homeCare.confirm.notIncluded.subtitle")}</p>
            <ul className="mt-3 space-y-1.5">
              {getHomeCareNotIncludedItems(t).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-slate-400" aria-hidden>
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400">{t("public.homeCare.confirm.footer")}</p>
    </div>
  );
}
