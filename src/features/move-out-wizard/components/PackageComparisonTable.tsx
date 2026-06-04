"use client";

import { usePublicT } from "@/i18n/public/usePublicT";
import { getPackageComparisonRows } from "../move-out-wizard.i18n";

type Props = {
  /** Inside collapsible — no outer section title. */
  embedded?: boolean;
};

export function PackageComparisonTable({ embedded = false }: Props) {
  const { t } = usePublicT();
  const rows = getPackageComparisonRows(t);
  const standardLabel = t("public.moveOut.standard.title");
  const premiumLabel = t("public.moveOut.premium.title");

  return (
    <div className={embedded ? "pt-2" : "space-y-3"}>
      {!embedded ? (
        <p className="text-sm font-medium text-slate-600">{t("public.common.compareDetails")}</p>
      ) : null}

      <div className="hidden overflow-hidden rounded-2xl border border-stone-200/80 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-[#F6F8FB]">
              <th className="px-4 py-3 font-semibold text-slate-500" scope="col" />
              <th className="px-4 py-3 font-semibold text-[#34597E]" scope="col">
                {standardLabel}
              </th>
              <th className="px-4 py-3 font-semibold text-slate-800" scope="col">
                {premiumLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.feature}
                className={`border-b border-stone-50 last:border-0 ${
                  row.highlight ? "bg-amber-50/30" : ""
                }`}
              >
                <th className="px-4 py-3 font-medium text-slate-700" scope="row">
                  {row.feature}
                </th>
                <td className="px-4 py-3 leading-relaxed text-slate-600">{row.standard}</td>
                <td className="px-4 py-3 leading-relaxed text-slate-600">{row.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <div
            key={row.feature}
            className={`rounded-2xl border border-stone-200/80 bg-white p-3 ${
              row.highlight ? "ring-1 ring-amber-100" : ""
            }`}
          >
            <p className="text-xs font-semibold text-slate-800">{row.feature}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs leading-relaxed text-slate-600">
              <div>
                <span className="font-semibold text-[#34597E]">{standardLabel}</span>
                <p className="mt-0.5">{row.standard}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-800">{premiumLabel}</span>
                <p className="mt-0.5">{row.premium}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
