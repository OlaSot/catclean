"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClientPortal } from "../providers/ClientPortalProvider";
import { CLIENT_PORTAL_NAV_ITEMS } from "../lib/client-portal-nav";

export default function ClientBottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useClientPortal();

  return (
    <nav
      aria-label="Client portal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:max-w-xl">
        {CLIENT_PORTAL_NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          const showBadge = item.href === "/app/client/notifications" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${
                active
                  ? "text-[#34597E]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="relative">
                <Icon
                  className="h-6 w-6"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                {showBadge ? (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#34597E] ring-2 ring-white" />
                ) : null}
              </span>
              <span
                className={`text-[0.6875rem] font-medium leading-none ${
                  active ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
