import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";

export type UploadCleanerAvatarApiResponse = {
  data: ActiveCleaner | null;
  error: string | null;
};
