"use client";

import { Droplets, Globe, PawPrint, type LucideIcon } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

const CURATED_TRUST_BADGES: { key: string; icon: LucideIcon }[] = [
  { key: "public.home.trust.petFriendly", icon: PawPrint },
  { key: "public.home.trust.steam", icon: Droplets },
  { key: "public.home.trust.online", icon: Globe },
];

type TrustBadgesProps = {
  /** Show the curated three-badge set (Homepage V2). Defaults to true. */
  curated?: boolean;
};

export function TrustBadges({ curated = true }: TrustBadgesProps) {
  const { t } = usePublicT();
  const badges = curated ? CURATED_TRUST_BADGES : CURATED_TRUST_BADGES;

  return (
    <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:gap-3">
      {badges.map(({ key, icon: Icon }) => (
        <span
          key={key}
          className="trust-badge inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border border-white/35 bg-white/45 px-3.5 py-1.5 text-center text-[0.6875rem] font-normal leading-tight text-slate-600 shadow-[0_2px_12px_rgba(52,89,126,0.05)] backdrop-blur-sm sm:text-xs"
        >
          <Icon className="h-3 w-3 shrink-0 text-[#5B8DB8]" aria-hidden />
          <span className="text-balance">{t(key)}</span>
        </span>
      ))}
    </div>
  );
}
