import type { CleanerProfileStatus } from "@/lib/constants/cleaner-status";

export type ActiveCleaner = {
  /** profiles.id — use for assignment (assigned_cleaner_id, order_assignments.cleaner_id) */
  id: string;
  /** cleaner_profiles.id — informational only, not for assignment */
  cleanerProfileId: string | null;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  baseCity: string | null;
  rating: number | null;
  status: CleanerProfileStatus;
  petFriendly: boolean;
  ownsVacuum: boolean;
  ownsSteamCleaner: boolean;
  acceptsWindows: boolean;
  acceptsDryCleaning: boolean;
  maxDailyHours: number;
  maxOrdersPerDay: number;
  preferredWorkCities: string[];
  isAcceptingOrders: boolean;
};
