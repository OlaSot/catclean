"use client";

import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { getTimeSlotLabel } from "@/i18n/public/schedule-i18n";
import {
  getEnhancementOptions,
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
  formatHomeResetDuration,
  formatHomeResetPrice,
  formatSizeLabel,
} from "../home-reset-wizard.utils";
import type { HomeResetWizardState } from "../home-reset-wizard.types";

type Props = {
  state: HomeResetWizardState;
  estimatePrice: number | null;
  estimateDurationMinutes: number | null;
  className?: string;
};

export function HomeResetSummarySidebar({
  state,
  estimatePrice,
  estimateDurationMinutes,
  className = "",
}: Props) {
  const { t, locale } = usePublicI18n();
  const hasContent = state.propertyType || hasDeepUpgradesSelected(state);
  const dateLocale = locale === "de" ? "de-DE" : "en-GB";

  const formattedDate = state.schedule.date
    ? new Date(`${state.schedule.date}T12:00:00`).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;

  const timeLabel = state.schedule.time ? getTimeSlotLabel(t, state.schedule.time) : null;

  const enhancementTitles = new Map(
    getEnhancementOptions(t).map((item) => [item.id, item.title])
  );
  const selectedExtras = getSelectedEnhancements(state);

  return (
    <aside
      className={`rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)] sm:p-6 ${className}`.trim()}
    >
      <h2 className="text-lg font-semibold text-slate-800">{t("public.homeReset.sidebar.title")}</h2>
      <p className="mt-1 text-sm text-slate-400">{t("public.homeReset.sidebar.live")}</p>

      <dl className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm">
        {!hasContent ? (
          <p className="text-slate-400">{t("public.homeReset.sidebar.empty")}</p>
        ) : (
          <>
            {state.propertyType ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.home")}
                value={translateHomeResetPropertyType(t, state.propertyType)}
              />
            ) : null}
            {state.propertySizeM2 ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.size")}
                value={formatSizeLabel(state.propertySizeM2)}
              />
            ) : null}
            {isKitchenDeepResetSelected(state) ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.included")}
                value={kitchenDeepResetSummaryLabel(t)}
              />
            ) : null}
            {isBathroomDeepResetSelected(state) ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.selectedOption")}
                value={bathroomDeepResetSummaryLabel(t)}
              />
            ) : null}
            {!hasDeepUpgradesSelected(state) ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.selectedOption")}
                value={t("public.homeReset.customize.standard.title")}
              />
            ) : null}
            {state.petsOption !== "no_pets" ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.pets")}
                value={translateHomeResetPets(t, state.petsOption)}
              />
            ) : null}
            {isPetHomeUpgradeIncluded(state) ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.included")}
                value={petHomeUpgradeSummaryLabel(t)}
              />
            ) : null}
            {selectedExtras.map((id) => {
              const title = enhancementTitles.get(id);
              return title ? (
                <SummaryRow key={id} label={t("public.homeReset.sidebar.extraCare")} value={title} />
              ) : null;
            })}
            {state.specialRequest.trim() ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.specialRequests")}
                value={t("public.homeReset.sidebar.specialRequestsAdded")}
              />
            ) : null}
            {formattedDate ? (
              <SummaryRow
                label={t("public.homeReset.sidebar.date")}
                value={timeLabel ? `${formattedDate} · ${timeLabel.split(" – ")[0]}` : formattedDate}
              />
            ) : null}
          </>
        )}
      </dl>

      <div className="mt-5 space-y-2 border-t border-stone-100 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-slate-400">{t("public.homeReset.sidebar.estimatedPrice")}</span>
          <span className="text-2xl font-semibold tracking-tight text-[#34597E]">
            {formatHomeResetPrice(estimatePrice)}
          </span>
        </div>
        {estimateDurationMinutes != null ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-400">{t("public.homeReset.sidebar.duration")}</span>
            <span className="text-sm font-medium text-slate-600">
              {formatHomeResetDuration(estimateDurationMinutes)}
            </span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-700">{value}</dd>
    </div>
  );
}
