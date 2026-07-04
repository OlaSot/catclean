"use client";

import { Check, Home, Package, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import type { HomeServiceId } from "./ServiceCarousel";

type MobileService = {
  id: HomeServiceId;
  titleKey: string;
  subtitleKey: string;
  icon: LucideIcon;
};

const PRIMARY_SERVICE: MobileService = {
  id: "home_reset",
  titleKey: "public.home.service.homeReset.title",
  subtitleKey: "public.home.service.homeReset.subtitle",
  icon: Home,
};

const SECONDARY_SERVICES: MobileService[] = [
  {
    id: "move_out",
    titleKey: "public.home.service.moveOut.title",
    subtitleKey: "public.home.service.moveOut.subtitle",
    icon: Package,
  },
  {
    id: "home_care",
    titleKey: "public.home.service.homeCare.title",
    subtitleKey: "public.home.service.homeCare.subtitle",
    icon: RefreshCw,
  },
];

type Props = {
  selectedId: HomeServiceId;
  onSelect: (id: HomeServiceId) => void;
};

export function HomeMobileFlagshipCard({ selectedId, onSelect }: Props) {
  const { t } = usePublicT();
  const selected = selectedId === PRIMARY_SERVICE.id;

  return (
    <button
      type="button"
      onClick={() => onSelect(PRIMARY_SERVICE.id)}
      aria-pressed={selected}
      className={`relative w-full rounded-[24px] border px-5 py-5 text-left transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] backdrop-blur-xl ${
        selected
          ? "border-white/45 bg-white/50 shadow-[0_12px_36px_rgba(52,89,126,0.1)] ring-1 ring-[#34597E]/10"
          : "border-white/35 bg-white/35 shadow-[0_8px_24px_rgba(52,89,126,0.05)]"
      }`}
    >
      {selected ? (
        <span
          className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#34597E] text-white shadow-sm"
          aria-hidden
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      ) : null}

      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#34597E]/15 bg-[#34597E]/8 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-[#34597E]">
        <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
        {t("public.home.badge.signature")}
      </span>

      <div className="flex items-start gap-4 pr-8">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-[0_6px_16px_rgba(52,89,126,0.1)] ring-1 ring-[#C5D9EB]/60">
          <PRIMARY_SERVICE.icon className="h-7 w-7 text-[#34597E]" strokeWidth={1.5} />
        </span>
        <span className="min-w-0 pt-0.5">
          <span className="block text-lg font-bold leading-tight tracking-tight text-slate-800">
            {t(PRIMARY_SERVICE.titleKey)}
          </span>
          <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-slate-500">
            {t(PRIMARY_SERVICE.subtitleKey)}
          </span>
        </span>
      </div>
    </button>
  );
}

export function HomeMobileSecondaryCards({ selectedId, onSelect }: Props) {
  const { t } = usePublicT();

  return (
    <div className="space-y-3">
      {SECONDARY_SERVICES.map((service) => {
        const selected = selectedId === service.id;
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            aria-pressed={selected}
            className={`relative flex w-full items-center gap-3.5 rounded-[20px] border px-4 py-3.5 text-left transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] backdrop-blur-xl ${
              selected
                ? "border-white/45 bg-white/45 shadow-[0_8px_24px_rgba(52,89,126,0.08)] ring-1 ring-[#34597E]/10"
                : "border-white/35 bg-white/30 shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
            }`}
          >
            <span
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
                selected ? "bg-[#EEF4FA] text-[#34597E]" : "bg-[#F4F8FB] text-[#5B8DB8]"
              }`}
            >
              <service.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 pr-6">
              <span className="block text-[0.9375rem] font-semibold leading-tight text-slate-800">
                {t(service.titleKey)}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                {t(service.subtitleKey)}
              </span>
            </span>
            {selected ? (
              <span
                className="absolute top-3.5 right-3.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#34597E] text-white"
                aria-hidden
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
