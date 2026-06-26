"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, Menu, X } from "lucide-react";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { SITE_NAV_LINKS } from "./site-layout";
import { usePublicT } from "@/i18n/public/usePublicT";

type SiteHeaderProps = {
  bookHref?: string;
  className?: string;
};

export function SiteHeader({ bookHref = "/booking", className = "" }: SiteHeaderProps) {
  const { t } = usePublicT();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`flex min-w-0 items-center justify-between gap-1.5 py-1.5 min-[420px]:gap-2 min-[420px]:py-2 sm:gap-3 md:gap-4 ${className}`.trim()}
      >
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-1.5 min-[420px]:gap-2 sm:gap-2.5 md:gap-3"
        >
          <Image
            src="/logo_main.svg"
            alt="CatClean"
            width={190}
            height={56}
            className="h-7 w-auto min-[375px]:h-8 min-[420px]:h-9 sm:h-10 md:h-11 lg:h-11 xl:h-10 2xl:h-14"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium text-slate-700 lg:flex xl:gap-3.5 xl:text-[0.8125rem] 2xl:gap-6 2xl:text-sm">
          {SITE_NAV_LINKS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="motion-hover-lift transition hover:text-[#34597E]"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 min-[420px]:gap-1.5 sm:gap-2 md:gap-3">
          <PublicLanguageSwitcher />
          <Link
            href={bookHref}
            className="motion-cta-glow motion-hover-lift inline-flex items-center gap-1 rounded-full bg-[#34597E] px-2 py-1.5 text-[10px] font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.35)] transition hover:bg-[#2d4d6f] min-[420px]:gap-1.5 min-[420px]:px-2.5 min-[420px]:py-2 min-[420px]:text-[11px] sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs md:px-4 md:text-sm lg:px-4 xl:px-3 xl:py-1.5 xl:text-xs 2xl:px-5 2xl:py-2 2xl:text-sm"
          >
            <Clock3 className="h-3 w-3 min-[420px]:h-3.5 min-[420px]:w-3.5 sm:h-4 sm:w-4" aria-hidden />
            <span className="hidden min-[480px]:inline">{t("public.header.bookCleaning")}</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-sm transition hover:border-[#34597E] hover:text-[#34597E] min-[420px]:h-9 min-[420px]:w-9 lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("public.nav.closeMenu") : t("public.nav.openMenu")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-4 w-4 min-[420px]:h-5 min-[420px]:w-5" /> : <Menu className="h-4 w-4 min-[420px]:h-5 min-[420px]:w-5" />}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]"
            aria-label={t("public.nav.closeMenu")}
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute top-0 right-0 flex h-full w-[min(100%,18rem)] flex-col gap-0.5 border-l border-slate-200/80 bg-white/98 p-4 shadow-2xl min-[420px]:w-[min(100%,20rem)] min-[420px]:gap-1 min-[420px]:p-5">
            <div className="mb-3 flex items-center justify-between min-[420px]:mb-4">
              <span className="text-xs font-semibold text-slate-500 min-[420px]:text-sm">
                {t("public.nav.menu")}
              </span>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 min-[420px]:h-9 min-[420px]:w-9"
                aria-label={t("public.nav.closeMenu")}
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-4 w-4 min-[420px]:h-5 min-[420px]:w-5" />
              </button>
            </div>
            {SITE_NAV_LINKS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#EEF4FA] hover:text-[#34597E] min-[420px]:py-3 min-[420px]:text-base"
                onClick={() => setMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href={bookHref}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#34597E] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.32)] min-[420px]:mt-4 min-[420px]:px-5 min-[420px]:py-3 min-[420px]:text-sm"
              onClick={() => setMenuOpen(false)}
            >
              <Clock3 className="h-3.5 w-3.5 min-[420px]:h-4 min-[420px]:w-4" aria-hidden />
              {t("public.header.bookCleaning")}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
