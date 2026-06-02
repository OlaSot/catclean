export const CLEANER_PROFILE_STATUSES = [
  "active",
  "pending",
  "paused",
  "blocked",
] as const;

export type CleanerProfileStatus = (typeof CLEANER_PROFILE_STATUSES)[number];

export const CLEANER_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "paused", label: "Paused" },
  { value: "blocked", label: "Blocked" },
] as const;

export function normalizeCleanerProfileStatus(
  status: string | null | undefined
): CleanerProfileStatus {
  const key = (status ?? "active").toLowerCase();
  if ((CLEANER_PROFILE_STATUSES as readonly string[]).includes(key)) {
    return key as CleanerProfileStatus;
  }
  return "active";
}

export function isCleanerProfileStatus(
  value: string
): value is CleanerProfileStatus {
  return (CLEANER_PROFILE_STATUSES as readonly string[]).includes(value);
}
