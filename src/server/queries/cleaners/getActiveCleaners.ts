import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import { getAdminCleaners } from "@/server/queries/cleaners/getAdminCleaners";

/** Active cleaners only — used by order assignment UI. */
export async function getActiveCleaners(): Promise<{
  cleaners: ActiveCleaner[];
  error: string | null;
}> {
  return getAdminCleaners({ status: "active" });
}
