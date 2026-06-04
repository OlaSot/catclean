import type { ReactNode } from "react";
import { SITE_CONTAINER_CLASS } from "./site-layout";
import { SiteHeader } from "./SiteHeader";

type SitePageShellProps = {
  children: ReactNode;
  bookHref?: string;
  showHeader?: boolean;
  backgroundClassName?: string;
  containerClassName?: string;
  contentClassName?: string;
};

export function SitePageShell({
  children,
  bookHref = "/booking",
  showHeader = true,
  backgroundClassName = "min-h-screen bg-[#EEF2F7] text-slate-700",
  containerClassName = "",
  contentClassName = "py-4 sm:py-6",
}: SitePageShellProps) {
  return (
    <main className={backgroundClassName}>
      <div className={`${SITE_CONTAINER_CLASS} ${contentClassName} ${containerClassName}`.trim()}>
        {showHeader ? <SiteHeader bookHref={bookHref} /> : null}
        {children}
      </div>
    </main>
  );
}
