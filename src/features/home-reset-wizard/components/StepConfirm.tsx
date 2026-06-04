"use client";

import { Calendar, ChefHat, Clock, Home, LayoutGrid, MessageSquare, Sparkles } from "lucide-react";
import { usePublicI18n } from "@/i18n/public/PublicI18nProvider";
import { getTimeSlotLabel } from "@/i18n/public/schedule-i18n";
import { WizardMotionImage } from "./WizardMotionImage";
import { HOME_RESET_IMAGES } from "../home-reset-wizard.constants";
import {
  getEnhancementOptions,
  getIncludedScopeSections,
  kitchenDeepResetSummaryLabel,
  petHomeUpgradeSummaryLabel,
  translateHomeResetPets,
  translateHomeResetPropertyType,
  translateHomeResetUpgrade,
} from "../home-reset-wizard.i18n";
import {
  getSelectedEnhancements,
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

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-stone-100 py-4 last:border-0">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-[#34597E]">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
        <p className="mt-0.5 text-base font-medium whitespace-pre-wrap text-slate-800">{value}</p>
      </div>
    </div>
  );
}

const EXTRA_CARE_ICONS = {
  oven_refresh: ChefHat,
  fridge_refresh: ChefHat,
  balcony_cleaning: LayoutGrid,
} as const;

export function StepConfirm({ state, estimatePrice }: Props) {
  const { t, locale } = usePublicI18n();
  const selectedExtras = getSelectedEnhancements(state);
  const enhancementTitles = new Map(
    getEnhancementOptions(t).map((item) => [item.id, item.title])
  );
  const includedSections = getIncludedScopeSections(t);
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
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-wide text-[#5B8DB8]">
            {t("public.homeReset.confirm.eyebrow")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
            {t("public.homeReset.confirm.title")}
          </h1>
          <p className="text-base leading-relaxed text-slate-500">{t("public.homeReset.confirm.subtitle")}</p>
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-stone-50/80 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-800">{t("public.homeReset.confirm.included.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("public.homeReset.confirm.included.subtitle")}</p>
          <div className="mt-4 space-y-4">
            {includedSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-semibold tracking-wide text-[#34597E] uppercase">{section.title}</p>
                <ul className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#34597E]/60" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-white p-2 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
          <SummaryItem icon={Sparkles} label={t("public.homeReset.confirm.service")} value={t("public.homeReset.confirm.service")} />
          {isKitchenDeepResetSelected(state) ? (
            <SummaryItem
              icon={ChefHat}
              label={t("public.homeReset.confirm.kitchenDeepReset")}
              value={kitchenDeepResetSummaryLabel(t)}
            />
          ) : (
            <SummaryItem
              icon={Sparkles}
              label={t("public.homeReset.confirm.selectedOption")}
              value={translateHomeResetUpgrade(t, state.upgrade)}
            />
          )}
          <SummaryItem
            icon={Home}
            label={t("public.homeReset.confirm.home")}
            value={`${translateHomeResetPropertyType(t, state.propertyType)} · ${formatSizeLabel(state.propertySizeM2)}`}
          />
          <SummaryItem icon={Sparkles} label={t("public.homeReset.confirm.pets")} value={translateHomeResetPets(t, state.petsOption)} />
          {isPetHomeUpgradeIncluded(state) ? (
            <SummaryItem
              icon={Sparkles}
              label={t("public.homeReset.confirm.petUpgrade")}
              value={petHomeUpgradeSummaryLabel(t)}
            />
          ) : null}
          {selectedExtras.map((id) => {
            const title = enhancementTitles.get(id);
            const Icon = EXTRA_CARE_ICONS[id];
            return title ? (
              <SummaryItem key={id} icon={Icon} label={t("public.homeReset.confirm.extraCare")} value={title} />
            ) : null;
          })}
          {selectedExtras.length === 0 ? (
            <SummaryItem
              icon={Sparkles}
              label={t("public.homeReset.confirm.extraCare")}
              value={t("public.homeReset.confirm.noneSelected")}
            />
          ) : null}
          {state.specialRequest.trim() ? (
            <SummaryItem
              icon={MessageSquare}
              label={t("public.homeReset.confirm.specialRequests")}
              value={state.specialRequest.trim()}
            />
          ) : null}
          <SummaryItem icon={Calendar} label={t("public.homeReset.confirm.date")} value={formattedDate} />
          <SummaryItem icon={Clock} label={t("public.homeReset.confirm.time")} value={timeLabel} />
        </div>

        <div className="flex items-baseline justify-between rounded-3xl border border-[#34597E]/15 bg-[#34597E]/[0.04] px-6 py-5">
          <span className="text-sm font-medium text-slate-600">{t("public.homeReset.confirm.estimatedPrice")}</span>
          <span className="text-3xl font-semibold tracking-tight text-[#34597E]">
            {formatHomeResetPrice(estimatePrice)}
          </span>
        </div>

        <p className="text-sm text-slate-400">{t("public.homeReset.confirm.footer")}</p>
      </div>

      <WizardMotionImage
        src={HOME_RESET_IMAGES.summary}
        alt={t("public.homeReset.confirm.imageAlt")}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        wrapperClassName="aspect-[4/5] rounded-3xl bg-stone-100 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:aspect-[5/6]"
      />
    </div>
  );
}
