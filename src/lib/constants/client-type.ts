export const CLIENT_TYPES = ["private", "business"] as const;

export type ClientType = (typeof CLIENT_TYPES)[number];

export const CLIENT_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "private", label: "Private" },
  { value: "business", label: "Business" },
] as const;

export function normalizeClientType(
  value: string | null | undefined
): ClientType | null {
  const key = (value ?? "").toLowerCase();
  if (key === "private" || key === "business") {
    return key;
  }
  return null;
}

export function isClientType(value: string): value is ClientType {
  return value === "private" || value === "business";
}

export function formatClientTypeLabel(value: string | null): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
