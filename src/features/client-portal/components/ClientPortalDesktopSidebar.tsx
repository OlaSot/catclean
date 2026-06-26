"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useClientPortal } from "../providers/ClientPortalProvider";
import { CLIENT_PORTAL_NAV_ITEMS } from "../lib/client-portal-nav";

export default function ClientPortalDesktopSidebar() {
  const pathname = usePathname();
  const { profile, unreadCount } = useClientPortal();

  return (
    <aside
      aria-label="Client portal navigation"
      className="sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col border-r border-slate-200/80 bg-white/80 px-4 py-8 backdrop-blur-md lg:flex xl:w-[240px]"
    >
      <Link href="/app/client" className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#34597E] text-sm font-bold text-white shadow-[0_8px_20px_rgba(52,89,126,0.25)]">
          CC
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-800">
            CatClean
          </p>
          <p className="text-xs text-slate-500">Client portal</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {CLIENT_PORTAL_NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          const showBadge = item.href === "/app/client/notifications" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[#EEF4FA] text-[#34597E] shadow-[inset_0_0_0_1px_rgba(197,217,235,0.9)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Icon
                className="h-5 w-5 shrink-0"
                strokeWidth={active ? 2.25 : 1.75}
                aria-hidden
              />
              {item.label}
              {showBadge ? (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#34597E] px-1.5 text-[0.625rem] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/app/client/profile"
        className="mt-auto flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-[#F6F8FB] p-3 transition hover:border-[#C5D9EB] hover:bg-white"
      >
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#EEF4FA] ring-2 ring-white">
          {profile?.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#34597E]">
              {profile?.firstName?.[0] ?? "?"}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {profile?.firstName ?? "Profile"}
          </p>
          <p className="truncate text-xs text-slate-500">View profile</p>
        </div>
      </Link>
    </aside>
  );
}
