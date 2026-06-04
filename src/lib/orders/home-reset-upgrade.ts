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
  const key = upgrade as HomeResetUpgradeId;
  return HOME_RESET_UPGRADE_SURCHARGE_EUR[key] ?? 0;
}

export function isHomeResetUpgradeId(value: string): value is HomeResetUpgradeId {
  return value in HOME_RESET_UPGRADE_SURCHARGE_EUR;
}
