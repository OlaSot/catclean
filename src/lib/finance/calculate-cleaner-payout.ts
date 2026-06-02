export const DEFAULT_CLEANER_PAYOUT_PERCENT = 50;

function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function calculateCleanerPayout(input: {
  orderTotal: number;
  payoutPercent?: number;
  adjustmentAmount?: number;
  manualAmount?: number | null;
}): {
  baseAmount: number;
  payoutPercent: number;
  suggestedAmount: number;
  adjustmentAmount: number;
  finalAmount: number;
  isManualOverride: boolean;
} {
  const baseAmount = Math.max(0, roundMoney(input.orderTotal));
  const payoutPercent = Number.isFinite(input.payoutPercent)
    ? (input.payoutPercent as number)
    : DEFAULT_CLEANER_PAYOUT_PERCENT;
  const adjustmentAmount = roundMoney(input.adjustmentAmount ?? 0);
  const suggestedAmount = roundMoney((baseAmount * payoutPercent) / 100);
  const isManualOverride = typeof input.manualAmount === "number";
  const calculatedFinal = isManualOverride
    ? roundMoney(input.manualAmount as number)
    : roundMoney(suggestedAmount + adjustmentAmount);
  const finalAmount = Math.max(0, calculatedFinal);

  return {
    baseAmount,
    payoutPercent,
    suggestedAmount,
    adjustmentAmount,
    finalAmount,
    isManualOverride,
  };
}
