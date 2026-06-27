"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { LOGIN_HERO_LINES, LOGIN_HERO_MOBILE_LINES } from "./login-styles";
import { LoginHeroVisual } from "./LoginHeroVisual";

const FLOATING_BADGES = [
  { label: "Secure", icon: ShieldCheck },
  { label: "Fast Booking", icon: Zap },
  { label: "Trusted Professionals", icon: Sparkles },
] as const;

type LoginHeroPanelProps = {
  variant?: "full" | "compact";
};

function HeroBadges({
  compact = false,
  inHero = false,
}: {
  compact?: boolean;
  inHero?: boolean;
}) {
  return (
    <div
      className={
        inHero
          ? "mt-2.5 flex flex-nowrap items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : compact
            ? "flex flex-nowrap items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex flex-wrap gap-2 sm:gap-2.5"
      }
    >
      {FLOATING_BADGES.map((badge) => {
        const Icon = badge.icon;

        if (inHero) {
          return (
            <span
              key={badge.label}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-medium text-white/95 backdrop-blur-sm"
            >
              <Check className="h-2.5 w-2.5 text-white/90" aria-hidden />
              {badge.label}
            </span>
          );
        }

        return (
          <span
            key={badge.label}
            className={
              compact
                ? "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#C5D9EB]/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                : "inline-flex items-center gap-2 rounded-full border border-[#C5D9EB]/80 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur-md sm:px-3.5 sm:py-2 sm:text-[0.8125rem]"
            }
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EEF4FA] text-[#34597E] sm:h-5 sm:w-5">
              <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden />
            </span>
            {!compact ? (
              <Icon className="h-3.5 w-3.5 text-[#5B8DB8]" aria-hidden />
            ) : null}
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}

function HeroCopy({
  compact = false,
  inHero = false,
}: {
  compact?: boolean;
  inHero?: boolean;
}) {
  const lines = inHero ? LOGIN_HERO_MOBILE_LINES : LOGIN_HERO_LINES;

  return (
    <div className={compact ? "space-y-0.5" : "space-y-1 sm:space-y-1.5"}>
      {lines.map((line, index) => (
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.2 + index * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`text-balance font-semibold tracking-tight ${
            inHero
              ? index === 0
                ? "text-[0.9375rem] leading-snug text-white"
                : "text-xs font-medium text-white/85"
              : compact
                ? index === 0
                  ? "text-sm text-slate-800"
                  : "hidden"
                : index === 0
                  ? "text-xl text-slate-800 sm:text-2xl"
                  : index === 1
                    ? "text-base text-slate-700 sm:text-lg"
                    : "text-sm text-slate-600 sm:text-base"
          }`}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

export function LoginHeroPanel({ variant = "full" }: LoginHeroPanelProps) {
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <div className="relative h-[clamp(140px,38vw,168px)] overflow-hidden rounded-[20px] shadow-[0_16px_40px_rgba(15,23,42,0.14)] ring-1 ring-white/60">
          <LoginHeroVisual
            priority
            sizes="100vw"
            imageClassName="object-cover object-[50%_30%]"
            className="absolute inset-0"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-slate-900/88 via-slate-900/45 to-slate-900/5"
            aria-hidden
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <HeroCopy compact inHero />
            <HeroBadges compact inHero />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      className="relative h-full w-full"
    >
      <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-[28px] shadow-[0_20px_56px_rgba(52,89,126,0.16)] ring-1 ring-white/70 sm:rounded-[32px]">
        <LoginHeroVisual priority className="absolute inset-0" />

        <div className="absolute inset-x-0 bottom-0 space-y-4 bg-linear-to-t from-white/96 via-white/72 to-transparent p-5 pt-16 sm:space-y-5 sm:p-7 sm:pt-20 lg:p-8 lg:pt-24">
          <HeroBadges />
          <HeroCopy />
        </div>
      </div>
    </motion.div>
  );
}
