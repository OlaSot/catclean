"use client";

import { BadgeCheck, Headphones, Heart, Leaf, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { wizardNavDivider } from "@/lib/design-system/tokens";

type TrustVariant = "premium" | "service";

type TrustItem = {
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
};

const PREMIUM_ITEMS: TrustItem[] = [
  { titleKey: "public.trust.petFriendly.title", descKey: "public.trust.petFriendly.desc", icon: Heart },
  { titleKey: "public.trust.eco.title", descKey: "public.trust.eco.desc", icon: Leaf },
  { titleKey: "public.trust.insured.title", descKey: "public.trust.insured.desc", icon: ShieldCheck },
  { titleKey: "public.trust.satisfaction.title", descKey: "public.trust.satisfaction.desc", icon: BadgeCheck },
];

const SERVICE_ITEMS: TrustItem[] = [
  { titleKey: "public.trust.eco.title", descKey: "public.trust.eco.desc", icon: Leaf },
  { titleKey: "public.trust.experienced.title", descKey: "public.trust.experienced.desc", icon: Users },
  { titleKey: "public.trust.satisfaction.title", descKey: "public.trust.satisfaction.desc", icon: BadgeCheck },
  { titleKey: "public.trust.support.title", descKey: "public.trust.support.desc", icon: Headphones },
];

type TrustStripProps = {
  variant?: TrustVariant;
};

export function TrustStrip({ variant = "premium" }: TrustStripProps) {
  const { t } = usePublicT();
  const items = variant === "premium" ? PREMIUM_ITEMS : SERVICE_ITEMS;

  return (
    <div
      className={`grid grid-cols-1 gap-8 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 ${wizardNavDivider}`}
    >
      {items.map((item) => (
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
