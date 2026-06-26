import { badgeBase, badgeSizes } from "./tokens";

/** Semantic badge color maps shared across admin, portal, and cleaner apps. */

export type BadgeTone =
  | "brand"
  | "sky"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "indigo"
  | "teal"
  | "slate";

export const badgeToneClasses: Record<BadgeTone, string> = {
  brand: "bg-[#EEF4FA] text-[#34597E] ring-[#C5D9EB]",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  teal: "bg-teal-50 text-teal-800 ring-teal-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function badgeClass(tone: BadgeTone, size: keyof typeof badgeSizes = "sm"): string {
  return `${badgeBase} ${badgeSizes[size]} ${badgeToneClasses[tone]}`;
}

/** Admin order status → badge tone */
export function orderStatusTone(status: string): BadgeTone {
  const map: Record<string, BadgeTone> = {
    awaiting_confirmation: "amber",
    new: "sky",
    waiting_for_payment: "amber",
    paid: "emerald",
    searching_cleaner: "violet",
    confirmed: "emerald",
    cleaner_assigned: "indigo",
    in_progress: "amber",
    problem: "rose",
    completed: "emerald",
    canceled: "rose",
    cancelled_by_client: "rose",
    cancelled_by_cleaner: "rose",
    cancelled_by_admin: "rose",
    refunded: "slate",
  };
  return map[status] ?? "sky";
}

/** Admin service type → badge tone */
export function serviceTypeTone(serviceType: string): BadgeTone {
  const map: Record<string, BadgeTone> = {
    home_care: "teal",
    home_reset: "violet",
    move_out: "indigo",
    regular_cleaning: "sky",
    move_in_out: "indigo",
    airbnb_turnover: "violet",
    office_cleaning: "emerald",
    dry_cleaning: "amber",
    window_cleaning: "slate",
    special_pet_package: "rose",
  };
  return map[serviceType.trim()] ?? "slate";
}

/** Portal order status → badge tone */
export function portalStatusTone(
  status: "confirmed" | "in_progress" | "completed" | "cancelled" | "awaiting_confirmation",
): BadgeTone {
  const map: Record<typeof status, BadgeTone> = {
    confirmed: "brand",
    awaiting_confirmation: "amber",
    in_progress: "amber",
    completed: "emerald",
    cancelled: "slate",
  };
  return map[status];
}
