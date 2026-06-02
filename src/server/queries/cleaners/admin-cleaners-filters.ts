import type { CleanerProfileStatus } from "@/lib/constants/cleaner-status";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";

export type AdminCleanersFilters = {
  search?: string;
  status?: "all" | CleanerProfileStatus;
  city?: string;
  petFriendly?: boolean;
  ownsVacuum?: boolean;
  ownsSteamCleaner?: boolean;
  acceptsWindows?: boolean;
  acceptsDryCleaning?: boolean;
};

export function applyAdminCleanersFilters(
  cleaners: ActiveCleaner[],
  filters: AdminCleanersFilters
): ActiveCleaner[] {
  let result = cleaners;

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    result = result.filter((cleaner) => {
      const haystack = [cleaner.name, cleaner.email, cleaner.phone]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter((cleaner) => cleaner.status === filters.status);
  }

  const city = filters.city?.trim().toLowerCase();
  if (city) {
    result = result.filter((cleaner) =>
      (cleaner.baseCity ?? "").toLowerCase().includes(city)
    );
  }

  if (filters.petFriendly === true) {
    result = result.filter((c) => c.petFriendly);
  } else if (filters.petFriendly === false) {
    result = result.filter((c) => !c.petFriendly);
  }

  if (filters.ownsVacuum === true) {
    result = result.filter((c) => c.ownsVacuum);
  } else if (filters.ownsVacuum === false) {
    result = result.filter((c) => !c.ownsVacuum);
  }

  if (filters.ownsSteamCleaner === true) {
    result = result.filter((c) => c.ownsSteamCleaner);
  } else if (filters.ownsSteamCleaner === false) {
    result = result.filter((c) => !c.ownsSteamCleaner);
  }

  if (filters.acceptsWindows === true) {
    result = result.filter((c) => c.acceptsWindows);
  } else if (filters.acceptsWindows === false) {
    result = result.filter((c) => !c.acceptsWindows);
  }

  if (filters.acceptsDryCleaning === true) {
    result = result.filter((c) => c.acceptsDryCleaning);
  } else if (filters.acceptsDryCleaning === false) {
    result = result.filter((c) => !c.acceptsDryCleaning);
  }

  return result;
}
