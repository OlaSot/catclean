import type { TranslationKey } from "@/i18n/i18n.types";

export type AdminNavItem = {
  href: string;
  labelKey: TranslationKey;
  /** Only highlight when pathname matches exactly (e.g. dashboard). */
  exact?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/app/admin", labelKey: "nav.dashboard", exact: true },
  { href: "/app/admin/orders", labelKey: "nav.orders" },
  { href: "/app/admin/schedule", labelKey: "nav.schedule" },
  { href: "/app/admin/clients", labelKey: "nav.clients" },
  { href: "/app/admin/cleaners", labelKey: "nav.cleaners" },
  { href: "/app/admin/reviews", labelKey: "nav.reviews" },
  { href: "/app/admin/complaints", labelKey: "nav.complaints" },
  { href: "/app/admin/services", labelKey: "nav.services" },
  { href: "/app/admin/settings", labelKey: "nav.settings" },
];

export function isAdminNavActive(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** List pages render their own hero title — skip duplicate in header. */
export function shouldHideAdminHeaderTitle(pathname: string): boolean {
  return (
    pathname.startsWith("/app/admin/orders") ||
    pathname.startsWith("/app/admin/schedule") ||
    pathname.startsWith("/app/admin/clients") ||
    pathname.startsWith("/app/admin/cleaners") ||
    pathname.startsWith("/app/admin/reviews") ||
    pathname.startsWith("/app/admin/complaints")
  );
}

export function getAdminPageTitleKey(pathname: string): TranslationKey {
  if (pathname === "/app/admin") return "nav.dashboard";
  if (pathname.startsWith("/app/admin/orders")) return "nav.orders";
  if (pathname.startsWith("/app/admin/schedule")) return "nav.schedule";
  if (pathname.startsWith("/app/admin/clients")) return "nav.clients";
  if (pathname.startsWith("/app/admin/cleaners")) return "nav.cleaners";
  if (pathname.startsWith("/app/admin/reviews")) return "nav.reviews";
  if (pathname.startsWith("/app/admin/complaints")) return "nav.complaints";
  if (pathname.startsWith("/app/admin/services")) return "nav.services";
  if (pathname.startsWith("/app/admin/settings")) return "nav.settings";
  return "nav.admin";
}
