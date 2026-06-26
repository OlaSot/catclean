import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarPlus,
  ClipboardList,
  Home,
  User,
} from "lucide-react";

export type ClientPortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

export const CLIENT_PORTAL_NAV_ITEMS: ClientPortalNavItem[] = [
  {
    href: "/app/client",
    label: "Home",
    icon: Home,
    match: (pathname) =>
      pathname === "/app/client" ||
      pathname === "/app/client/preferred-cleaner" ||
      pathname === "/app/client/addresses",
  },
  {
    href: "/app/client/orders",
    label: "Orders",
    icon: ClipboardList,
    match: (pathname) => pathname.startsWith("/app/client/orders"),
  },
  {
    href: "/booking",
    label: "Book",
    icon: CalendarPlus,
    match: () => false,
  },
  {
    href: "/app/client/notifications",
    label: "Notifications",
    icon: Bell,
    match: (pathname) => pathname.startsWith("/app/client/notifications"),
  },
  {
    href: "/app/client/profile",
    label: "Profile",
    icon: User,
    match: (pathname) => pathname.startsWith("/app/client/profile"),
  },
];
