"use client";

import { Check, Minus, X } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { ComparisonCell, ComparisonRow, ServiceId, ServiceProfile } from "../service-comparison.types";

type Props = {
  activeServiceId: ServiceId;
  profiles: Record<ServiceId, ServiceProfile>;
  rows: ComparisonRow[];
};

function ComparisonCellView({ cell }: { cell: ComparisonCell }) {
  const { t } = usePublicT();

  if (cell.kind === "yes") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#34597E]">
        <Check className="h-4 w-4 shrink-0" />
        {t("public.compare.cell.included")}
      </span>
    );
  }
  if (cell.kind === "no") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
        <X className="h-4 w-4 shrink-0" />
        —
      </span>
    );
  }
  if (cell.kind === "partial") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5f89b1]">
        <Minus className="h-4 w-4 shrink-0" />
        {cell.label ?? t("public.compare.partial")}
      </span>
    );
  }
  return <span className="text-sm font-medium text-slate-700">{cell.label}</span>;
}

export function ServiceComparisonTable({ activeServiceId, profiles, rows }: Props) {
  const { t } = usePublicT();
  const serviceOrder: ServiceId[] = ["home_reset", "move_out", "regular_cleaning"];

  return (
    <div className="overflow-hidden rounded-3xl border border-[#dfe9f3] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <div className="border-b border-[#e7eff7] bg-[linear-gradient(145deg,#fafdff_20%,#edf4fb_100%)] px-6 py-5 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
          {t("public.compare.table.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{t("public.compare.table.subtitle")}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e7eff7]">
              <th className="px-4 py-4 text-sm font-semibold text-slate-500 sm:px-6">
                {t("public.compare.table.whatYouGet")}
              </th>
              {serviceOrder.map((id) => {
                const profile = profiles[id];
                const isActive = id === activeServiceId;
                return (
                  <th
                    key={id}
                    className={`px-4 py-4 text-sm font-semibold sm:px-5 ${
                      isActive ? "bg-[#eef5fc] text-[#34597E]" : "text-slate-700"
                    }`}
                  >
                    <span className="block">{profile.title}</span>
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">
                      {profile.tagline}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.feature}
                className={index % 2 === 0 ? "bg-white" : "bg-[#fafcff]/80"}
              >
                <td className="px-4 py-3.5 sm:px-6">
                  <p className="text-sm font-medium text-slate-700">{row.feature}</p>
                  {row.hint ? <p className="mt-0.5 text-xs text-slate-400">{row.hint}</p> : null}
                </td>
                {serviceOrder.map((id) => (
                  <td
                    key={id}
                    className={`px-4 py-3.5 sm:px-5 ${id === activeServiceId ? "bg-[#f6faff]/90" : ""}`}
                  >
                    <ComparisonCellView cell={row[id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
