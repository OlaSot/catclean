/** Human-readable order reference for UI (no API changes). */
export function formatOrderDisplayId(
  id: number | string | null | undefined,
  orderNumber?: string | null
): string {
  if (orderNumber?.trim()) {
    return orderNumber.trim();
  }

  if (typeof id === "number" && Number.isFinite(id) && id > 0) {
    return String(id);
  }

  if (typeof id === "string" && id.trim() !== "") {
    const parsed = Number(id);
    if (Number.isFinite(parsed) && parsed > 0) {
      return String(parsed);
    }
    const compact = id.replace(/-/g, "");
    if (compact.length >= 6) {
      return compact.slice(-6).toUpperCase();
    }
    return id.slice(0, 8).toUpperCase();
  }

  return "—";
}
