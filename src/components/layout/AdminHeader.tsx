"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useT } from "@/i18n/useT";

type AdminHeaderProps = {
  title: string;
  showTitle?: boolean;
  userEmail: string;
  userRole: string;
};

export default function AdminHeader({
  title,
  showTitle = true,
  userEmail,
  userRole,
}: AdminHeaderProps) {
  const router = useRouter();
  const { t } = useT();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-[#E5EDF5] bg-white px-8 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {showTitle ? (
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">
            {title}
          </h1>
        ) : (
          <div className="min-h-[28px]" aria-hidden />
        )}

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher />
          <NotificationBell userRole={userRole} />
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5EDF5] bg-[#F6F8FB] px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34597E]/10 text-xs font-bold text-[#34597E]">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="max-w-[200px] truncate text-sm font-medium text-slate-800">
                {userEmail}
              </p>
              <p className="text-xs capitalize text-slate-500">{userRole}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#5B8DB8]/40 hover:bg-[#EEF4FA] hover:text-[#34597E]"
          >
            {t("admin.logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
