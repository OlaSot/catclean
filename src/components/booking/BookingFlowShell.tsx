import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { SitePageShell } from "@/components/layout/SitePageShell";
import { SITE_CONTAINER_CLASS } from "@/components/layout/site-layout";

type BookingFlowShellProps = {
  children: ReactNode;
  portalMode?: boolean;
  backgroundClassName?: string;
  contentClassName?: string;
};

export function BookingFlowShell({
  children,
  portalMode = false,
  backgroundClassName = "min-h-screen bg-[var(--cc-page-bg)] text-slate-700",
  contentClassName = "py-4 sm:py-6",
}: BookingFlowShellProps) {
  if (!portalMode) {
    return (
      <SitePageShell backgroundClassName={backgroundClassName} contentClassName={contentClassName}>
        {children}
      </SitePageShell>
    );
  }

  return (
    <div className={backgroundClassName}>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className={`${SITE_CONTAINER_CLASS} flex h-16 items-center justify-between gap-4`}>
          <Link href="/app/client" className="inline-flex items-center gap-2 text-sm font-semibold text-[#34597E] hover:text-[#2d4d6f]">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Back to my bookings</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <Link href="/app/client" aria-label="CatClean client portal" className="absolute left-1/2 -translate-x-1/2">
            <Image src="/logo_main.svg" alt="CatClean" width={150} height={44} className="h-8 w-auto" priority />
          </Link>
          <PublicLanguageSwitcher />
        </div>
      </header>
      <main className={`${SITE_CONTAINER_CLASS} ${contentClassName}`.trim()}>
        <div className="mb-5 rounded-2xl border border-[#C5D9EB] bg-[#EEF4FA] px-4 py-3 sm:px-5">
          <p className="text-sm font-semibold text-[#34597E]">New booking</p>
          <p className="mt-0.5 text-xs text-slate-500">Your saved contact details and address will be filled in automatically.</p>
        </div>
        {children}
      </main>
    </div>
  );
}
