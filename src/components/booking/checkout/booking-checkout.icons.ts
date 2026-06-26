import { Calendar, Clock, Home, PawPrint, Sparkles, type LucideIcon } from "lucide-react";

export const CHECKOUT_OVERVIEW_ICONS = {
  property: Home,
  pets: PawPrint,
  date: Calendar,
  time: Clock,
  package: Sparkles,
} as const;

export type CheckoutOverviewIconId = keyof typeof CHECKOUT_OVERVIEW_ICONS;

export function getCheckoutOverviewIcon(id: CheckoutOverviewIconId): LucideIcon {
  return CHECKOUT_OVERVIEW_ICONS[id];
}
