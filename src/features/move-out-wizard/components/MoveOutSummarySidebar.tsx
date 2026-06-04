"use client";

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

export function MoveOutSummarySidebar({ state, estimatePrice, className = "" }: Props) {
  const { t, locale } = usePublicI18n();
  const dateLocale = locale === "de" ? "de-DE" : "en-GB";

  const formattedDate = state.schedule.date
    ? new Date(`${state.schedule.date}T12:00:00`).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;

  const timeLabel = state.schedule.time ? getTimeSlotLabel(t, state.schedule.time) : null;

  const extras = getActiveExtras(state)
    .map((id) => translateExtra(t, id).title)
    .join(", ");

  return (
    <aside
      className={`rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)] sm:p-6 ${className}`.trim()}
    >
      <h2 className="text-lg font-semibold text-slate-800">{t("public.moveOut.sidebar.title")}</h2>
      <p className="mt-1 text-sm text-slate-400">{t("public.moveOut.sidebar.live")}</p>

      <dl className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-sm">
        <SummaryRow label={t("public.homeCare.summary.service")} value={t("public.booking.moveOut")} />
        {state.package ? (
          <SummaryRow
            label={t("public.moveOut.summary.package")}
            value={translatePackage(t, state.package)}
          />
        ) : null}
        <SummaryRow label={t("public.moveOut.summary.size")} value={formatSizeLabel(state.propertySizeM2)} />
        {extras ? (
          <SummaryRow label={t("public.moveOut.summary.extras")} value={extras} />
        ) : null}
        {formattedDate && timeLabel ? (
          <SummaryRow
            label={t("public.moveOut.summary.schedule")}
            value={`${formattedDate} · ${timeLabel}`}
          />
        ) : null}
      </dl>

      <div className="mt-5 border-t border-stone-100 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("public.moveOut.summary.price")}
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#34597E]">
          {formatMoveOutPrice(estimatePrice)}
        </p>
      </div>
    </aside>
  );
}
