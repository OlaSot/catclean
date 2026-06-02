"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useT } from "@/i18n/useT";
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
  const title = t(getAdminPageTitleKey(pathname));
  const showTitle = !shouldHideAdminHeaderTitle(pathname);

  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      <AdminSidebar userEmail={userEmail} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={title}
          showTitle={showTitle}
          userEmail={userEmail}
          userRole={userRole}
        />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1280px] px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
