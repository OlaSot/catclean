"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import { AdminMobileDrawer } from "@/components/layout/AdminMobileDrawer";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useT } from "@/i18n/useT";
import {
  ADMIN_CONTENT_CLASS,
  ADMIN_MAIN_CLASS,
  ADMIN_SHELL_CLASS,
} from "@/lib/admin-styles";
import {
  getAdminPageTitleKey,
  shouldHideAdminHeaderTitle,
} from "@/lib/admin-nav";

type AdminShellProps = {
  children: ReactNode;
  userEmail: string;
  userRole: string;
};

export default function AdminShell({
  children,
  userEmail,
  userRole,
}: AdminShellProps) {
  const pathname = usePathname();
  const { t } = useT();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const title = t(getAdminPageTitleKey(pathname));
  const showTitle = !shouldHideAdminHeaderTitle(pathname);

  return (
    <div className={ADMIN_SHELL_CLASS}>
      <AdminSidebar userEmail={userEmail} />
      <AdminMobileDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        userEmail={userEmail}
      />
      <div className={ADMIN_MAIN_CLASS}>
        <AdminHeader
          title={title}
          showTitle={showTitle}
          userEmail={userEmail}
          userRole={userRole}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className={`${ADMIN_CONTENT_CLASS} min-h-full`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
