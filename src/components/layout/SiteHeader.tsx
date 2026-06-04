"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { SITE_NAV_LINKS } from "./site-layout";
import { usePublicT } from "@/i18n/public/usePublicT";

type SiteHeaderProps = {
  bookHref?: string;
  className?: string;
};

export function SiteHeader({ bookHref = "/booking", className = "" }: SiteHeaderProps) {
  const { t } = usePublicT();

  return (
    <header className={`flex items-center justify-between gap-3 py-2 sm:gap-4 ${className}`.trim()}>
      <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3">
        <Image
          src="/logo_main.svg"
          alt="CatClean"
          width={190}
          height={56}
          className="h-10 w-auto sm:h-12 md:h-14"
          priority
        />
      </Link>

      <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
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

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <PublicLanguageSwitcher />
        <Link
          href={bookHref}
          className="motion-cta-glow motion-hover-lift inline-flex items-center gap-2 rounded-full bg-[#34597E] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(52,89,126,0.35)] transition hover:bg-[#2d4d6f] sm:px-5 sm:text-sm"
        >
          <Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          <span>{t("public.header.bookCleaning")}</span>
        </Link>
      </div>
    </header>
  );
}
