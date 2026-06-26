import type { ReactNode } from "react";
import ClientBottomNav from "./ClientBottomNav";
import ClientPortalDesktopSidebar from "./ClientPortalDesktopSidebar";
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
  return (
    <div className={`${PORTAL_PAGE_CLASS} ${PORTAL_SHELL_CLASS}`}>
      {!hideNav ? <ClientPortalDesktopSidebar /> : null}
      <div className={PORTAL_MAIN_CLASS}>
        <div className={PORTAL_CONTENT_CLASS}>{children}</div>
      </div>
      {!hideNav ? <ClientBottomNav /> : null}
    </div>
  );
}
