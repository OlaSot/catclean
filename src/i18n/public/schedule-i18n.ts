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

const SLOT_KEY_BY_ID: Record<string, string> = {
  "09:00": "public.schedule.slot.0900",
  "11:00": "public.schedule.slot.1100",
  "13:00": "public.schedule.slot.1300",
  "15:00": "public.schedule.slot.1500",
  "17:00": "public.schedule.slot.1700",
};

export function getWeekdayLabels(t: PublicTranslateFn): string[] {
  return WEEKDAY_KEYS.map((key) => t(key));
}

export function getTimeSlotLabel(t: PublicTranslateFn, slotId: string): string {
  const key = SLOT_KEY_BY_ID[slotId];
  return key ? t(key) : slotId;
}
