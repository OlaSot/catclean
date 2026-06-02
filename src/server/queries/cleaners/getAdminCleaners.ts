import {
  mapActiveCleanerRow,
  mapProfileToAdminCleaner,
} from "@/entities/cleaner/active-cleaner.mapper";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import {
  applyAdminCleanersFilters,
  type AdminCleanersFilters,
} from "@/server/queries/cleaners/admin-cleaners-filters";

const PROFILE_CLEANER_SELECT = `
  id,
  full_name,
  email,
  phone,
  avatar_url,
  role,
  cleaner_profiles (
    id,
    profile_id,
    status,
    base_city,
    rating,
    pet_friendly,
    owns_vacuum,
    owns_steam_cleaner,
    accepts_windows,
    accepts_dry_cleaning,
    max_daily_hours,
    max_orders_per_day,
    preferred_work_cities,
    is_accepting_orders
  )
`;

const PROFILE_CLEANER_SELECT_LEGACY = `
  id,
  full_name,
  email,
  phone,
  avatar_url,
  role,
  cleaner_profiles (
    id,
    profile_id,
    status,
    base_city,
    rating,
    pet_friendly,
    owns_vacuum,
    owns_steam_cleaner,
    accepts_windows,
    accepts_dry_cleaning
  )
`;

const CLEANER_PROFILE_SELECT = `
  id,
  profile_id,
  status,
  base_city,
  rating,
  pet_friendly,
  owns_vacuum,
  owns_steam_cleaner,
  accepts_windows,
  accepts_dry_cleaning,
  max_daily_hours,
  max_orders_per_day,
  preferred_work_cities,
  is_accepting_orders,
  profile:profiles (
    id,
    full_name,
    email,
    phone,
    avatar_url,
    role
  )
`;

const CLEANER_PROFILE_SELECT_LEGACY = `
  id,
  profile_id,
  status,
  base_city,
  rating,
  pet_friendly,
  owns_vacuum,
  owns_steam_cleaner,
  accepts_windows,
  accepts_dry_cleaning,
  profile:profiles (
    id,
    full_name,
    email,
    phone,
    avatar_url,
    role
  )
`;

function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "42703";
}

function sortCleaners(cleaners: ActiveCleaner[]): ActiveCleaner[] {
  return [...cleaners].sort((a, b) => a.name.localeCompare(b.name));
}

function mapAllCleanersFromProfiles(
  profileRows: unknown[]
): ActiveCleaner[] {
  return profileRows
    .map((row) =>
      mapProfileToAdminCleaner(
        row as Parameters<typeof mapProfileToAdminCleaner>[0]
      )
    )
    .filter((item): item is ActiveCleaner => Boolean(item));
}

export async function getAdminCleaners(
  filters: AdminCleanersFilters = {}
): Promise<{
  cleaners: ActiveCleaner[];
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();

  const profileQuery = await supabase
    .from("profiles")
    .select(PROFILE_CLEANER_SELECT)
    .eq("role", "cleaner");
  let profileRows: unknown[] | null = profileQuery.data as unknown[] | null;
  let profileError = profileQuery.error;

  if (profileError && isMissingColumnError(profileError)) {
    const fallback = await supabase
      .from("profiles")
      .select(PROFILE_CLEANER_SELECT_LEGACY)
      .eq("role", "cleaner");
    profileRows = fallback.data;
    profileError = fallback.error;
  }

  let cleaners: ActiveCleaner[] = [];

  if (!profileError && profileRows?.length) {
    cleaners = mapAllCleanersFromProfiles(profileRows);
  }

  if (profileError) {
    console.error("getAdminCleaners profiles:", profileError);
  }

  if (cleaners.length === 0) {
    const cleanerQuery = await supabase
      .from("cleaner_profiles")
      .select(CLEANER_PROFILE_SELECT)
      .order("base_city", { ascending: true, nullsFirst: false });
    let cleanerRows: unknown[] | null = cleanerQuery.data as unknown[] | null;
    let cleanerError = cleanerQuery.error;

    if (cleanerError && isMissingColumnError(cleanerError)) {
      const fallback = await supabase
        .from("cleaner_profiles")
        .select(CLEANER_PROFILE_SELECT_LEGACY)
        .order("base_city", { ascending: true, nullsFirst: false });
      cleanerRows = fallback.data;
      cleanerError = fallback.error;
    }

    if (cleanerError) {
      console.error("getAdminCleaners cleaner_profiles:", cleanerError);
      return {
        cleaners: [],
        error: profileError?.message ?? cleanerError.message,
      };
    }

    cleaners = sortCleaners(
      (cleanerRows ?? [])
        .map((row) =>
          mapActiveCleanerRow(row as Parameters<typeof mapActiveCleanerRow>[0])
        )
        .filter((item): item is ActiveCleaner => Boolean(item))
    );
  }

  const filtered = applyAdminCleanersFilters(cleaners, filters);

  return { cleaners: sortCleaners(filtered), error: null };
}
