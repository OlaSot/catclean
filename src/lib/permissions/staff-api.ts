export const STAFF_API_ROLES = ["admin", "operator"] as const;

export type StaffApiRole = (typeof STAFF_API_ROLES)[number];

export function isStaffApiRole(
  role: string | null | undefined
): role is StaffApiRole {
  return role === "admin" || role === "operator";
}
