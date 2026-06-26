"use client";

import { usePublicT } from "@/i18n/public/usePublicT";
import { getCheckoutOverviewIcon } from "./booking-checkout.icons";
import type { CheckoutDetailRow, CheckoutOverviewRow } from "./booking-checkout.types";

type Props = {
  rows: CheckoutOverviewRow[];
  detailRows?: CheckoutDetailRow[];
};

export function BookingOverviewCard({ rows, detailRows = [] }: Props) {
  const { t } = usePublicT();

  return (
    <section className="checkout-card-hover rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_6px_28px_rgba(15,23,42,0.05)] sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
        {t("public.checkout.overview.title")}
      </h2>

      <dl className="mt-5 space-y-0">
        {rows.map((row) => {
          const Icon = getCheckoutOverviewIcon(row.icon);

          return (
            <div
              key={row.id}
              className="flex items-start gap-4 border-b border-stone-100/90 py-4 last:border-0"
            >
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-[#34597E]"
                aria-hidden
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                  {row.label}
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
                  {row.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>

      {detailRows.length > 0 ? (
        <div className="mt-2 space-y-0 border-t border-stone-100/90 pt-1">
          {detailRows.map((row) => (
            <div
              key={row.id}
              className="flex items-start justify-between gap-4 border-b border-stone-50 py-3 text-sm last:border-0"
            >
              <span className="text-slate-500">{row.label}</span>
              <span className="max-w-[58%] text-right font-medium text-slate-700">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
