import { normalizeCleanerProfileStatus } from "@/lib/constants/cleaner-status";
import type { ActiveCleaner } from "./active-cleaner.types";

type SupabaseCleanerProfileRow = {
  id?: string | null;
  profile_id?: string | null;
  status: string | null;
  base_city: string | null;
  rating: number | null;
  pet_friendly: boolean | null;
  owns_vacuum: boolean | null;
  owns_steam_cleaner: boolean | null;
  accepts_windows: boolean | null;
  accepts_dry_cleaning: boolean | null;
  max_daily_hours?: number | null;
  max_orders_per_day?: number | null;
  preferred_work_cities?: string[] | null;
  is_accepting_orders?: boolean | null;
};

type SupabaseProfileFields = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
};

export type SupabaseProfileWithCleanerRow = SupabaseProfileFields & {
  role: string | null;
  cleaner_profiles?:
    | SupabaseCleanerProfileRow
    | SupabaseCleanerProfileRow[]
    | null;
};

type SupabaseCleanerProfileWithProfileRow = SupabaseCleanerProfileRow & {
  profile?: SupabaseProfileWithCleanerRow | SupabaseProfileWithCleanerRow[] | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function buildCleanerFromRows(
  profile: SupabaseProfileFields,
  cleanerProfile: SupabaseCleanerProfileRow,
  options: { activeOnly: boolean }
): ActiveCleaner | null {
  const status = normalizeCleanerProfileStatus(cleanerProfile.status);

  if (options.activeOnly && status !== "active") {
    return null;
  }

  const profileId = profile.id;
  const cleanerProfileId = cleanerProfile.id?.trim() || null;

  if (
    cleanerProfile.profile_id &&
    cleanerProfile.profile_id !== profileId
  ) {
    console.warn("[mapActiveCleaner] cleaner_profiles.profile_id mismatch", {
      profiles_id: profileId,
      cleaner_profiles_profile_id: cleanerProfile.profile_id,
    });
  }

  const name =
    profile.full_name?.trim() ||
    profile.email?.trim() ||
    profile.phone?.trim() ||
    "Unknown cleaner";

  return {
    id: profileId,
    cleanerProfileId,
    name,
    email: profile.email?.trim() || "—",
    phone: profile.phone?.trim() || "—",
    avatarUrl: profile.avatar_url?.trim() || null,
    baseCity: cleanerProfile.base_city?.trim() || null,
    rating:
      typeof cleanerProfile.rating === "number" ? cleanerProfile.rating : null,
    status,
    petFriendly: Boolean(cleanerProfile.pet_friendly),
    ownsVacuum: Boolean(cleanerProfile.owns_vacuum),
    ownsSteamCleaner: Boolean(cleanerProfile.owns_steam_cleaner),
    acceptsWindows: Boolean(cleanerProfile.accepts_windows),
    acceptsDryCleaning: Boolean(cleanerProfile.accepts_dry_cleaning),
    maxDailyHours: Math.max(1, Number(cleanerProfile.max_daily_hours ?? 8)),
    maxOrdersPerDay: Math.max(1, Number(cleanerProfile.max_orders_per_day ?? 4)),
    preferredWorkCities: Array.isArray(cleanerProfile.preferred_work_cities)
      ? cleanerProfile.preferred_work_cities.filter((city) => typeof city === "string")
      : [],
    isAcceptingOrders: cleanerProfile.is_accepting_orders !== false,
  };
}

export function mapProfileToActiveCleaner(
  row: SupabaseProfileWithCleanerRow
): ActiveCleaner | null {
  if (!row.id || row.role !== "cleaner") return null;

  const cleanerProfile = unwrapRelation(row.cleaner_profiles);
  if (!cleanerProfile) return null;

  return buildCleanerFromRows(row, cleanerProfile, { activeOnly: true });
}

export function mapProfileToAdminCleaner(
  row: SupabaseProfileWithCleanerRow
): ActiveCleaner | null {
  if (!row.id || row.role !== "cleaner") return null;

  const cleanerProfile = unwrapRelation(row.cleaner_profiles);
  if (!cleanerProfile) return null;

  return buildCleanerFromRows(row, cleanerProfile, { activeOnly: false });
}

export function mapActiveCleanerRow(
  row: SupabaseCleanerProfileWithProfileRow
): ActiveCleaner | null {
  const profile = unwrapRelation(row.profile);
  if (!profile?.id || profile.role !== "cleaner") return null;

  return buildCleanerFromRows(profile, row, { activeOnly: false });
}
