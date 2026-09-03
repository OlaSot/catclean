"use client";

import { usePublicT } from "@/i18n/public/usePublicT";

export function HomeSocialTrust() {
  const { t } = usePublicT();

  return (
    <section
      aria-label={t("public.home.social.aria")}
      className="mt-8 border-t border-white/60 bg-[var(--cc-page-bg)] px-5 py-10 sm:mt-10 sm:px-6 lg:mt-12 lg:px-8 dark:border-white/10"
    >
      <div className="mx-auto flex max-w-[1720px] flex-col items-center gap-3 text-center">
        <p className="text-lg tracking-[0.12em] text-[#34597E]/90 sm:text-xl" aria-hidden>
          {t("public.home.social.rating")}
        </p>
        <p className="text-balance max-w-md text-[0.9375rem] leading-relaxed font-normal text-slate-600 sm:text-base">
          {t("public.home.social.line")}
        </p>
        <p className="text-balance max-w-lg text-xs leading-relaxed text-slate-400 sm:text-sm">
          {t("public.home.social.supporting")}
        </p>
      </div>
    </section>
  );
}
