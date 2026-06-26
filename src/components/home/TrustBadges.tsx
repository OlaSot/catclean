"use client";

import {
  Droplets,
  Globe,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";

const TRUST_BADGES: { key: string; icon: LucideIcon }[] = [
  { key: "public.home.trust.deepRefresh", icon: Sparkles },
  { key: "public.home.trust.petFriendly", icon: PawPrint },
  { key: "public.home.trust.steam", icon: Droplets },
  { key: "public.home.trust.reliable", icon: ShieldCheck },
  { key: "public.home.trust.fastEasy", icon: Zap },
  { key: "public.home.trust.online", icon: Globe },
];

export function TrustBadges() {
  const { t } = usePublicT();

  return (
    <div className="mt-3 grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-2 sm:mt-4 sm:gap-2 md:mt-4 md:flex md:flex-wrap md:items-stretch md:justify-center md:gap-2 lg:gap-2.5 xl:mt-3 xl:gap-1.5 2xl:mt-6 2xl:gap-3.5">
      {TRUST_BADGES.map(({ key, icon: Icon }) => (
        <span
          key={key}
          className="trust-badge motion-reveal motion-hover-lift inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#c9d8e8]/80 bg-linear-to-br from-white/98 via-[#eef5fb]/94 to-[#dce9f5]/88 px-2.5 py-1.5 text-center text-xs leading-tight font-semibold text-slate-700 shadow-[0_6px_16px_rgba(52,89,126,0.10)] min-[420px]:gap-2 min-[420px]:px-3 min-[420px]:py-1.5 sm:px-3.5 sm:py-2 sm:text-sm md:w-auto md:px-4 md:py-2 lg:px-5 lg:py-2 xl:gap-1.5 xl:px-2.5 xl:py-1 xl:text-[0.6875rem] 2xl:gap-2.5 2xl:px-6 2xl:py-3 2xl:text-lg"
        >
          <Icon
            className="h-3 w-3 shrink-0 text-[#5B8DB8] min-[420px]:h-3.5 min-[420px]:w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 xl:h-3 xl:w-3 2xl:h-5 2xl:w-5"
            aria-hidden
          />
          <span className="text-balance">{t(key)}</span>
        </span>
      ))}
    </div>
  );
}
