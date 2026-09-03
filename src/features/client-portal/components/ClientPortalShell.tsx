"use client";

import type { ReactNode } from "react";
import ClientBottomNav from "./ClientBottomNav";
import ClientPortalDesktopSidebar from "./ClientPortalDesktopSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { useT } from "@/i18n/useT";
import {
  PORTAL_CONTENT_CLASS,
  PORTAL_MAIN_CLASS,
  PORTAL_PAGE_CLASS,
  PORTAL_SHELL_CLASS,
} from "../lib/portal-styles";

type ClientPortalShellProps = {
  children: ReactNode;
  hideNav?: boolean;
};

export default function ClientPortalShell({
  children,
  hideNav = false,
}: ClientPortalShellProps) {
  const { t } = useT();

  return (
    <div className={`${PORTAL_PAGE_CLASS} ${PORTAL_SHELL_CLASS}`}>
      {!hideNav ? <ClientPortalDesktopSidebar /> : null}
      <div className={PORTAL_MAIN_CLASS}>
        <div className="flex items-center justify-end gap-2 px-5 pt-4 lg:hidden">
          <PublicLanguageSwitcher />
          <ThemeToggle
            compact
            toDarkLabel={t("admin.theme.toDark")}
            toLightLabel={t("admin.theme.toLight")}
          />
        </div>
        <div className={PORTAL_CONTENT_CLASS}>{children}</div>
      </div>
      {!hideNav ? <ClientBottomNav /> : null}
    </div>
  );
}
