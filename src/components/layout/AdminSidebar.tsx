"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/useT";
import type { TranslationKey } from "@/i18n/i18n.types";
import {
  ADMIN_NAV_ITEMS,
  isAdminNavActive,
} from "@/lib/admin-nav";

type NavIconProps = {
  className?: string;
};

function IconDashboard({ className = "h-5 w-5" }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconOrders({ className = "h-5 w-5" }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUsers({ className = "h-5 w-5" }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 20v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1M12 11a4 4 0 100-8 4 4 0 000 8zm8 9v-1a3 3 0 00-2-2.83M16 3.17a3 3 0 010 5.66"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSparkles({ className = "h-5 w-5" }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l1.2 3.6L17 8l-3.6 1.2L12 13l-1.2-3.8L7 8l3.8-1.4L12 3zm7 11l.9 2.7 2.7.9-2.7.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9.9-2.7zM5 14l.7 2.1 2.1.7-2.1.7L5 19l-.7-2.1-2.1-.7 2.1-.7L5 14z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSettings({ className = "h-5 w-5" }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

const NAV_ICONS: Partial<Record<TranslationKey, (props: NavIconProps) => ReactNode>> =
  {
    "nav.dashboard": IconDashboard,
    "nav.orders": IconOrders,
    "nav.schedule": IconOrders,
    "nav.clients": IconUsers,
    "nav.cleaners": IconSparkles,
    "nav.reviews": IconSparkles,
    "nav.complaints": IconSparkles,
    "nav.services": IconSparkles,
    "nav.settings": IconSettings,
  };

type AdminSidebarProps = {
  userEmail: string;
};

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#E5EDF5] bg-white shadow-[4px_0_32px_rgba(52,89,126,0.06)]">
      <div className="px-5 pt-7">
        <Link href="/app/admin" className="block rounded-2xl p-1 transition hover:bg-[#EEF4FA]">
          <Image
            src="/logo_main.svg"
            alt="CatClean"
            width={168}
            height={40}
            className="h-9 w-auto"
            priority
          />
          <p className="mt-3 text-xs font-medium tracking-wide text-slate-500">
            {t("admin.crmBadge")}
          </p>
        </Link>
      </div>

      <nav
        className="mt-8 flex flex-1 flex-col gap-1 px-3"
        aria-label="Навигация админки"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isAdminNavActive(pathname, item.href, item.exact);
          const Icon = NAV_ICONS[item.labelKey] ?? IconDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-[#34597E] text-white shadow-[0_8px_20px_rgba(52,89,126,0.22)]"
                  : "text-slate-600 hover:bg-[#EEF4FA] hover:text-[#34597E]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#E5EDF5] px-5 py-5">
        <p className="truncate text-xs font-medium text-slate-700">{userEmail}</p>
        <p className="mt-1 text-[11px] text-slate-400">CatClean CRM · v0.1</p>
      </div>
    </aside>
  );
}
