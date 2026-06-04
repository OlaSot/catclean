"use client";

import { BadgeCheck, Heart, Leaf, ShieldCheck } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

const TRUST_ITEMS = [
  { titleKey: "public.trust.petFriendly.title", descKey: "public.trust.petFriendly.desc", icon: Heart },
  { titleKey: "public.trust.eco.title", descKey: "public.trust.eco.desc", icon: Leaf },
  { titleKey: "public.trust.insured.title", descKey: "public.trust.insured.desc", icon: ShieldCheck },
  { titleKey: "public.trust.satisfaction.title", descKey: "public.trust.satisfaction.desc", icon: BadgeCheck },
] as const;

export function TrustStrip() {
  const { t } = usePublicT();

  return (
    <div className="grid grid-cols-1 gap-8 border-t border-stone-100 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {TRUST_ITEMS.map((item) => (
        <div key={item.titleKey} className="flex flex-col items-center text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#34597E]/[0.08] text-[#34597E]">
            <item.icon className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-800">{t(item.titleKey)}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">{t(item.descKey)}</p>
        </div>
      ))}
    </div>
  );
}
