import {
  isCleanerProfileStatus,
  type CleanerProfileStatus,
} from "@/lib/constants/cleaner-status";
import type { AdminCleanersFilters } from "@/server/queries/cleaners/admin-cleaners-filters";

function parseOptionalBoolean(
  value: string | null
): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function parseAdminCleanersQuery(
  searchParams: URLSearchParams
): AdminCleanersFilters {
  const filters: AdminCleanersFilters = {};

  const search = searchParams.get("search")?.trim();
  if (search) {
    filters.search = search;
  }

  const statusRaw = searchParams.get("status")?.trim().toLowerCase();
  if (statusRaw && statusRaw !== "all") {
    if (isCleanerProfileStatus(statusRaw)) {
      filters.status = statusRaw as CleanerProfileStatus;
    }
  }

  const city = searchParams.get("city")?.trim();
  if (city) {
    filters.city = city;
  }

  const petFriendly = parseOptionalBoolean(searchParams.get("pet_friendly"));
  if (petFriendly !== undefined) filters.petFriendly = petFriendly;

  const ownsVacuum = parseOptionalBoolean(searchParams.get("owns_vacuum"));
  if (ownsVacuum !== undefined) filters.ownsVacuum = ownsVacuum;

  const ownsSteamCleaner = parseOptionalBoolean(
    searchParams.get("owns_steam_cleaner")
  );
  if (ownsSteamCleaner !== undefined) filters.ownsSteamCleaner = ownsSteamCleaner;

  const acceptsWindows = parseOptionalBoolean(searchParams.get("accepts_windows"));
  if (acceptsWindows !== undefined) filters.acceptsWindows = acceptsWindows;

  const acceptsDryCleaning = parseOptionalBoolean(
    searchParams.get("accepts_dry_cleaning")
  );
  if (acceptsDryCleaning !== undefined) {
    filters.acceptsDryCleaning = acceptsDryCleaning;
  }

  return filters;
}
