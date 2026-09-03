import type { PublicTranslateFn } from "@/i18n/public/public-i18n.types";

const WEEKDAY_KEYS = [
  "public.schedule.weekday.mon",
  "public.schedule.weekday.tue",
  "public.schedule.weekday.wed",
  "public.schedule.weekday.thu",
  "public.schedule.weekday.fri",
  "public.schedule.weekday.sat",
  "public.schedule.weekday.sun",
] as const;

export function getWeekdayLabels(t: PublicTranslateFn): string[] {
  return WEEKDAY_KEYS.map((key) => t(key));
}

export function getTimeSlotLabel(_t: PublicTranslateFn, slotId: string): string {
  return slotId;
}
