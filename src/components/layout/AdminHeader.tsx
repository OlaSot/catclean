"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { LogOut, Menu } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useT } from "@/i18n/useT";

type AdminHeaderProps = {
  title: string;
  showTitle?: boolean;
  userEmail: string;
  userRole: string;
  onOpenMobileNav: () => void;
};

export default function AdminHeader({
  title,
  showTitle = true,
  userEmail,
  userRole,
  onOpenMobileNav,
}: AdminHeaderProps) {
  const router = useRouter();
  const { t } = useT();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className="z-40 shrink-0 border-b border-[#E5EDF5] bg-white/95 px-[clamp(0.625rem,2.5vw,2rem)] py-[clamp(0.375rem,1vh,1rem)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="inline-flex h-[clamp(2rem,8vmin,2.5rem)] w-[clamp(2rem,8vmin,2.5rem)] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#34597E]/30 hover:text-[#34597E] lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-[clamp(1rem,4vmin,1.25rem)] w-[clamp(1rem,4vmin,1.25rem)]" />
          </button>
          {showTitle ? (
            <h1 className="truncate text-[clamp(0.875rem,3.8vmin,1.25rem)] font-semibold tracking-tight text-slate-800">
              {title}
            </h1>
          ) : (
            <div className="min-h-[1.25rem] min-w-0 flex-1 lg:hidden" aria-hidden />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle
            toDarkLabel={t("admin.theme.toDark")}
            toLightLabel={t("admin.theme.toLight")}
          />
          <LanguageSwitcher />
          <NotificationBell userRole={userRole} />
          <div className="hidden items-center gap-3 rounded-2xl border border-[#E5EDF5] bg-[#F6F8FB] px-4 py-2 md:flex">
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
            className="inline-flex h-[clamp(2rem,8vmin,2.5rem)] w-[clamp(2rem,8vmin,2.5rem)] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#5B8DB8]/40 hover:bg-[#EEF4FA] hover:text-[#34597E] sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[clamp(0.6875rem,2.5vmin,0.875rem)] sm:font-semibold"
            aria-label={t("admin.logout")}
          >
            <LogOut className="h-4 w-4 sm:hidden" aria-hidden />
            <span className="hidden sm:inline">{t("admin.logout")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
