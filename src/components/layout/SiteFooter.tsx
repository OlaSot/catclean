"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { usePublicT } from "@/i18n/public/usePublicT";
import { SITE_CONTAINER_CLASS, SITE_NAV_LINKS } from "./site-layout";

export function SiteFooter() {
  const { t } = usePublicT();
  return (
    <footer className="overflow-hidden bg-[linear-gradient(135deg,#1f3d59_0%,#294f71_58%,#345f85_100%)] text-white">
      <div className={`${SITE_CONTAINER_CLASS} grid gap-9 py-10 md:grid-cols-[1.25fr_0.7fr_1fr] md:items-start md:py-12`}>
        <div>
          <Link href="/" aria-label="CatClean" className="inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm"><Image src="/logo_main.svg" alt="CatClean" width={166} height={48} /></Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{t("public.footer.description")}</p>
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-white"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10"><MapPin className="h-4 w-4" /></span>{t("public.footer.area")}</p>
        </div>
        <nav aria-label={t("public.footer.navigation")}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{t("public.footer.navigation")}</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-1">
            {SITE_NAV_LINKS.map((item) => <Link key={item.key} href={item.href} className="w-fit text-sm text-white/75 transition hover:text-white">{t(item.key)}</Link>)}
          </div>
        </nav>
        <div className="border-l-0 border-white/15 md:border-l md:pl-8">
          <h2 className="text-xl font-semibold tracking-tight text-white">{t("public.footer.ctaTitle")}</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/65">{t("public.footer.ctaText")}</p>
          <Link href="/booking" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#294f71] shadow-[0_8px_22px_rgba(10,25,40,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f3f7fb]">{t("public.header.bookCleaning")}<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
      <div className="border-t border-white/10"><div className={`${SITE_CONTAINER_CLASS} py-4 text-center text-xs text-white/45 md:text-left`}>© {new Date().getFullYear()} CatClean. {t("public.footer.rights")}</div></div>
    </footer>
  );
}
