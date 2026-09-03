"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ComponentType } from "react";
import { ArrowRight, Check, ChevronDown, Home, Package, RefreshCw, X } from "lucide-react";
import { SERVICE_IDS } from "../service-comparison.data";
import type { ServiceId } from "../service-comparison.types";
import { usePublicT } from "@/i18n/public/usePublicT";
import { getLocalizedComparisonRows, getLocalizedServiceProfiles } from "../service-comparison.i18n";
import { ServiceComparisonTable } from "./ServiceComparisonTable";

const SERVICE_TAB_META: Record<ServiceId, { icon: ComponentType<{ className?: string }> }> = {
  home_reset: { icon: Home }, move_out: { icon: Package }, regular_cleaning: { icon: RefreshCw },
};
const NOT_INCLUDED_KEYS = [
  "public.compare.notIncluded.renovation", "public.compare.notIncluded.mold",
  "public.compare.notIncluded.exteriorWindows", "public.compare.notIncluded.hazardous",
] as const;

type Props = { initialServiceId?: ServiceId };
function withService(template: string, service: string) { return template.replace("{service}", service); }

export function ServiceComparisonView({ initialServiceId = "home_reset" }: Props) {
  const { t } = usePublicT();
  const [activeId, setActiveId] = useState<ServiceId>(initialServiceId);
  const profiles = useMemo(() => getLocalizedServiceProfiles(t), [t]);
  const comparisonRows = useMemo(() => getLocalizedComparisonRows(t), [t]);
  const profile = profiles[activeId];
  const bookingHref = `/booking?service=${activeId}`;

  const handleSelect = useCallback((id: ServiceId) => {
    setActiveId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("service", id);
    window.history.replaceState(null, "", url.toString());
  }, []);

  return (
    <div className="pb-12">
      <section className="mx-auto mt-6 max-w-3xl text-center sm:mt-10">
        <span className="inline-flex rounded-full border border-[#c9d8e8] bg-white px-4 py-1.5 text-sm font-semibold text-[#34597E]">{t("public.compare.badge")}</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl">{t("public.compare.hero.title")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{t("public.compare.hero.subtitle")}</p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3" role="tablist" aria-label={t("public.compare.tabs.aria")}>
        {SERVICE_IDS.map((id) => {
          const item = profiles[id]; const Icon = SERVICE_TAB_META[id].icon; const selected = id === activeId;
          return (
            <button key={id} type="button" role="tab" aria-selected={selected} onClick={() => handleSelect(id)}
              className={`relative rounded-3xl border p-5 text-left transition duration-200 ${selected ? "border-[#34597E] bg-[#34597E] text-white shadow-[0_16px_34px_rgba(52,89,126,0.24)] md:-translate-y-1" : "border-[#dce8f3] bg-white text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.05)] hover:border-[#a9c2d9]"}`}>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${selected ? "bg-white/20" : "bg-[#eef4fb] text-[#5B8DB8]"}`}><Icon className="h-5 w-5" /></span>
              {selected ? <span className="absolute top-5 right-5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">{t("public.compare.selectedService")}</span> : null}
              <h2 className="mt-4 text-xl font-semibold">{item.title}</h2>
              <p className={`mt-1 text-sm leading-relaxed ${selected ? "text-white/80" : "text-slate-500"}`}>{item.tagline}</p>
            </button>
          );
        })}
      </section>

      <section key={activeId} className="motion-fade-in mt-8 rounded-4xl border border-[#dce8f3] bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-8">
        <div className="flex flex-col gap-5 border-b border-[#e7eff7] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-wider text-[#5f89b1]">{profile.tagline}</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-800">{profile.title}</h2><p className="mt-3 leading-relaxed text-slate-600">{profile.shortDescription}</p></div>
          <Link href={bookingHref} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#34597E] px-6 py-3 font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.25)] transition hover:bg-[#2d4d6f]">{t("public.compare.bookService")}<ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-7 grid gap-7 lg:grid-cols-[0.85fr_1.4fr]">
          <div><h3 className="text-lg font-semibold text-slate-800">{withService(t("public.compare.included.title"), profile.title)}</h3><ul className="mt-4 space-y-2.5">{profile.included.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5B8DB8]" />{item}</li>)}</ul></div>
          <div><h3 className="text-lg font-semibold text-slate-800">{withService(t("public.compare.checklist.title"), profile.title)}</h3><p className="mt-1 text-sm text-slate-500">{t("public.compare.checklist.subtitle")}</p><div className="mt-4 space-y-3">
            {profile.cleaningAreas.map((area, index) => <details key={area.key} open={index === 0} className="group rounded-2xl border border-[#e2ebf4] bg-[#fbfdff] px-4 py-3"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-700">{area.title}<ChevronDown className="h-4 w-4 shrink-0 text-[#5B8DB8] transition group-open:rotate-180" /></summary><ul className="mt-3 grid gap-2 border-t border-[#e7eff7] pt-3 sm:grid-cols-2">{area.items.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6B96BC]" />{item}</li>)}</ul></details>)}
          </div></div>
        </div>
      </section>

      <section className="mt-10"><ServiceComparisonTable activeServiceId={activeId} profiles={profiles} rows={comparisonRows} /></section>

      <section className="mt-8 rounded-3xl border border-[#eadfe3] bg-[#fffafb] p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="lg:w-56"><h2 className="text-xl font-semibold text-slate-800">{t("public.compare.notIncluded.title")}</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">{t("public.compare.notIncluded.pageSubtitle")}</p></div><ul className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">{NOT_INCLUDED_KEYS.map((key) => <li key={key} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm text-slate-600"><X className="h-4 w-4 shrink-0 text-[#be6a7a]" />{t(key)}</li>)}</ul></div></section>

      <section className="mt-8 rounded-4xl bg-[linear-gradient(135deg,#34597E,#4879a6)] px-6 py-8 text-center text-white shadow-[0_18px_40px_rgba(52,89,126,0.2)] sm:px-10">
        <h2 className="text-2xl font-semibold sm:text-3xl">{withService(t("public.compare.cta.title"), profile.title)}</h2><p className="mx-auto mt-2 max-w-2xl text-sm text-white/80 sm:text-base">{withService(t("public.compare.cta.subtitle"), profile.title)}</p>
        <Link href={bookingHref} className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-[#34597E] transition hover:bg-[#f4f8fc]">{t("public.compare.cta.calculate")}<ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
