/** Home Reset upgrade surcharges (EUR). Kept in lib for order creation; mirrored in wizard constants. */
export const HOME_RESET_UPGRADE_SURCHARGE_EUR = {
  standard_home_reset: 0,
  kitchen_upgrade: 39,
  bathroom_upgrade: 39,
  /** Legacy bookings only — Pet Home is included via pets step, not charged. */
  pet_hair_upgrade: 0,
} as const;

export type HomeResetUpgradeId = keyof typeof HOME_RESET_UPGRADE_SURCHARGE_EUR;

export function getHomeResetUpgradeSurchargeEur(upgrade: string | null | undefined): number {
  if (!upgrade) return 0;
  if (upgrade.includes(",")) {
    return getHomeResetUpgradesSurchargeEur(upgrade);
  }
  const key = upgrade as HomeResetUpgradeId;
  return HOME_RESET_UPGRADE_SURCHARGE_EUR[key] ?? 0;
}

const PAID_UPGRADE_IDS = ["kitchen_upgrade", "bathroom_upgrade"] as const;

export function parseHomeResetUpgradeIds(
  value: string | null | undefined,
): Array<(typeof PAID_UPGRADE_IDS)[number]> {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is (typeof PAID_UPGRADE_IDS)[number] =>
      PAID_UPGRADE_IDS.includes(part as (typeof PAID_UPGRADE_IDS)[number]),
    );
}

export function getHomeResetUpgradesSurchargeEur(value: string | null | undefined): number {
  return parseHomeResetUpgradeIds(value).reduce(
    (sum, id) => sum + HOME_RESET_UPGRADE_SURCHARGE_EUR[id],
    0,
  );
}

export function serializeHomeResetUpgradeIds(
  upgrades: { kitchen: boolean; bathroom: boolean },
): string {
  const parts: string[] = [];
  if (upgrades.kitchen) parts.push("kitchen_upgrade");
  if (upgrades.bathroom) parts.push("bathroom_upgrade");
  return parts.length > 0 ? parts.join(",") : "standard_home_reset";
}

export function isHomeResetUpgradeId(value: string): value is HomeResetUpgradeId {
  return value in HOME_RESET_UPGRADE_SURCHARGE_EUR;
}
