import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";

export type AdminCleanersApiResponse = {
  data: ActiveCleaner[] | null;
  error: string | null;
};
