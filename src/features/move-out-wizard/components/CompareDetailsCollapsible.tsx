"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { PackageComparisonTable } from "./PackageComparisonTable";

export function CompareDetailsCollapsible() {
  const { t } = usePublicT();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-stone-200/70 bg-stone-50/50">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-slate-700">{t("public.common.compareDetails")}</p>
          <p className="mt-0.5 text-xs text-slate-500">{t("public.common.compareDetailsHint")}</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="border-t border-stone-200/80 px-4 pb-5 pt-2 sm:px-5">
          <PackageComparisonTable embedded />
        </div>
      ) : null}
    </div>
  );
}
