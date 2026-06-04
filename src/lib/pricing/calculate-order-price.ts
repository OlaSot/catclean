import type { OrderServiceType } from "@/lib/constants/orders";
import {
  MINIMUM_ORDER_AMOUNT_DEFAULT_EUR,
  MINIMUM_ORDER_AMOUNT_EUR,
  PRICING_EXTRAS_EUR,
  PRICING_RATE_EUR_PER_M2,
  REGULAR_CLEANING_DEEP_MULTIPLIER,
  supportsAutoPricing,
} from "@/lib/pricing/pricing.constants";

export type PriceBreakdownLine = {
  key: string;
  label: string;
  amount: number;
};

export type OrderPriceBreakdown = {
  currency: "EUR";
  lines: PriceBreakdownLine[];
  baseAmount: number;
  extrasAmount: number;
  subtotalBeforeMinimum: number;
  minimumAmount: number | null;
  minimumApplied: boolean;
  autoPrice: number;
  manualOverride?: boolean;
  manualPrice?: number;
};

export type CalculateOrderPriceResult = {
  estimatedPrice: number;
  priceBreakdown: OrderPriceBreakdown;
  estimatedDurationMinutes: number;
  autoCalculated: boolean;
};

export type RegularCleaningPricingInput = {
  propertySizeM2: number;
  cleaningIntensity?: "standard" | "deep" | null;
  ovenCleaning?: boolean;
  fridgeCleaning?: boolean;
  insideCabinets?: boolean;
  balconyIncluded?: boolean;
  windowsInside?: boolean;
  hasPets?: boolean;
};

export type MoveInOutPricingInput = {
  propertySizeM2: number;
  packageType?: "standard" | "premium" | string | null;
  ovenCleaning?: boolean;
  fridgeCleaning?: boolean;
  insideCabinets?: boolean;
  windowsInside?: boolean;
  balconyIncluded?: boolean;
};

export type OfficeCleaningPricingInput = {
  officeSizeM2: number;
};

export type OrderPricingServiceDetails =
  | { serviceType: "regular_cleaning"; details: RegularCleaningPricingInput }
  | { serviceType: "move_in_out"; details: MoveInOutPricingInput }
  | { serviceType: "office_cleaning"; details: OfficeCleaningPricingInput };

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function positiveInt(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}

function collectExtras(
  flags: Partial<Record<keyof typeof PRICING_EXTRAS_EUR, boolean>>
): PriceBreakdownLine[] {
  const lines: PriceBreakdownLine[] = [];
  for (const [key, amount] of Object.entries(PRICING_EXTRAS_EUR)) {
    const extraKey = key as keyof typeof PRICING_EXTRAS_EUR;
    if (flags[extraKey]) {
      lines.push({
        key: extraKey,
        label: key.replace(/_/g, " "),
        amount,
      });
    }
  }
  return lines;
}

function applyMinimum(
  subtotal: number,
  serviceType: OrderServiceType
): { total: number; minimum: number | null; applied: boolean } {
  const minimum =
    MINIMUM_ORDER_AMOUNT_EUR[serviceType] ?? MINIMUM_ORDER_AMOUNT_DEFAULT_EUR;
  if (subtotal < minimum) {
    return { total: minimum, minimum, applied: true };
  }
  return { total: subtotal, minimum, applied: false };
}

function calculateRegularCleaning(
  details: RegularCleaningPricingInput
): CalculateOrderPriceResult | null {
  const m2 = positiveInt(details.propertySizeM2);
  if (!m2) return null;

  const intensity = details.cleaningIntensity === "deep" ? "deep" : "standard";
  const rate =
    PRICING_RATE_EUR_PER_M2.regular_cleaning *
    (intensity === "deep" ? REGULAR_CLEANING_DEEP_MULTIPLIER : 1);

  const baseAmount = roundMoney(m2 * rate);
  const extraLines = collectExtras({
    oven_cleaning: Boolean(details.ovenCleaning),
    fridge_cleaning: Boolean(details.fridgeCleaning),
    inside_cabinets: Boolean(details.insideCabinets),
    balcony: Boolean(details.balconyIncluded),
    windows_inside: Boolean(details.windowsInside),
    pets: Boolean(details.hasPets),
  });
  const extrasAmount = roundMoney(
    extraLines.reduce((sum, line) => sum + line.amount, 0)
  );
  const subtotalBeforeMinimum = roundMoney(baseAmount + extrasAmount);
  const { total, minimum, applied } = applyMinimum(
    subtotalBeforeMinimum,
    "regular_cleaning"
  );

  const lines: PriceBreakdownLine[] = [
    {
      key: "base",
      label: `Base (${m2} m² × €${rate.toFixed(2)}/m²${intensity === "deep" ? ", deep" : ""})`,
      amount: baseAmount,
    },
    ...extraLines,
  ];
  if (applied && minimum != null) {
    lines.push({
      key: "minimum_adjustment",
      label: `Minimum order (€${minimum})`,
      amount: roundMoney(total - subtotalBeforeMinimum),
    });
  }

  const estimatedDurationMinutes = Math.max(
    120,
    Math.round((m2 / 20) * 60)
  );

  const priceBreakdown: OrderPriceBreakdown = {
    currency: "EUR",
    lines,
    baseAmount,
    extrasAmount,
    subtotalBeforeMinimum,
    minimumAmount: minimum,
    minimumApplied: applied,
    autoPrice: total,
  };

  return {
    estimatedPrice: total,
    priceBreakdown,
    estimatedDurationMinutes,
    autoCalculated: true,
  };
}

function calculateMoveInOut(
  details: MoveInOutPricingInput
): CalculateOrderPriceResult | null {
  const m2 = positiveInt(details.propertySizeM2);
  if (!m2) return null;

  const pkg = (details.packageType ?? "standard").toLowerCase();
  const rate =
    pkg === "premium"
      ? PRICING_RATE_EUR_PER_M2.move_in_out_premium
      : PRICING_RATE_EUR_PER_M2.move_in_out_standard;

  const baseAmount = roundMoney(m2 * rate);
  const extraLines = collectExtras({
    oven_cleaning: Boolean(details.ovenCleaning),
    fridge_cleaning: Boolean(details.fridgeCleaning),
    inside_cabinets: Boolean(details.insideCabinets),
    balcony: Boolean(details.balconyIncluded),
  });
  if (details.windowsInside) {
    extraLines.push({
      key: "windows_inside",
      label: "windows inside",
      amount: 35,
    });
  }
  const extrasAmount = roundMoney(
    extraLines.reduce((sum, line) => sum + line.amount, 0)
  );
  const subtotalBeforeMinimum = roundMoney(baseAmount + extrasAmount);
  const { total, minimum, applied } = applyMinimum(
    subtotalBeforeMinimum,
    "move_in_out"
  );

  const lines: PriceBreakdownLine[] = [
    {
      key: "base",
      label: `Base (${m2} m² × €${rate}/m², ${pkg})`,
      amount: baseAmount,
    },
    ...extraLines,
  ];
  if (applied && minimum != null) {
    lines.push({
      key: "minimum_adjustment",
      label: `Minimum order (€${minimum})`,
      amount: roundMoney(total - subtotalBeforeMinimum),
    });
  }

  const estimatedDurationMinutes = Math.max(180, Math.round((m2 / 15) * 60));

  return {
    estimatedPrice: total,
    priceBreakdown: {
      currency: "EUR",
      lines,
      baseAmount,
      extrasAmount,
      subtotalBeforeMinimum,
      minimumAmount: minimum,
      minimumApplied: applied,
      autoPrice: total,
    },
    estimatedDurationMinutes,
    autoCalculated: true,
  };
}

function calculateOfficeCleaning(
  details: OfficeCleaningPricingInput
): CalculateOrderPriceResult | null {
  const m2 = positiveInt(details.officeSizeM2);
  if (!m2) return null;

  const rate = PRICING_RATE_EUR_PER_M2.office_cleaning;
  const baseAmount = roundMoney(m2 * rate);
  const subtotalBeforeMinimum = baseAmount;
  const { total, minimum, applied } = applyMinimum(
    subtotalBeforeMinimum,
    "office_cleaning"
  );

  const lines: PriceBreakdownLine[] = [
    {
      key: "base",
      label: `Base (${m2} m² × €${rate}/m²)`,
      amount: baseAmount,
    },
  ];
  if (applied && minimum != null) {
    lines.push({
      key: "minimum_adjustment",
      label: `Minimum order (€${minimum})`,
      amount: roundMoney(total - subtotalBeforeMinimum),
    });
  }

  const estimatedDurationMinutes = Math.max(120, Math.round((m2 / 25) * 60));

  return {
    estimatedPrice: total,
    priceBreakdown: {
      currency: "EUR",
      lines,
      baseAmount,
      extrasAmount: 0,
      subtotalBeforeMinimum,
      minimumAmount: minimum,
      minimumApplied: applied,
      autoPrice: total,
    },
    estimatedDurationMinutes,
    autoCalculated: true,
  };
}

export function calculateOrderPrice(
  input: OrderPricingServiceDetails
): CalculateOrderPriceResult | null {
  switch (input.serviceType) {
    case "regular_cleaning":
      return calculateRegularCleaning(input.details);
    case "move_in_out":
      return calculateMoveInOut(input.details);
    case "office_cleaning":
      return calculateOfficeCleaning(input.details);
    default:
      return null;
  }
}

export function tryCalculateOrderPrice(
  serviceType: string | null | undefined,
  serviceDetails: unknown
): CalculateOrderPriceResult | null {
  if (!supportsAutoPricing(serviceType) || !serviceDetails) {
    return null;
  }

  const raw = serviceDetails as Record<string, unknown>;

  if (serviceType === "regular_cleaning") {
    const m2 = Number(raw.propertySizeM2 ?? raw.property_size_m2);
    return calculateOrderPrice({
      serviceType: "regular_cleaning",
      details: {
        propertySizeM2: m2,
        cleaningIntensity:
          raw.cleaningIntensity === "deep" || raw.cleaning_intensity === "deep"
            ? "deep"
            : "standard",
        ovenCleaning: Boolean(raw.ovenCleaning ?? raw.oven_cleaning),
        fridgeCleaning: Boolean(raw.fridgeCleaning ?? raw.fridge_cleaning),
        insideCabinets: Boolean(raw.insideCabinets ?? raw.inside_cabinets),
        balconyIncluded: Boolean(
          raw.balconyIncluded ?? raw.balcony_included
        ),
        windowsInside: Boolean(
          raw.windowsInside ?? raw.windows_inside
        ),
        hasPets: Boolean(raw.hasPets ?? raw.has_pets),
      },
    });
  }

  if (serviceType === "move_in_out") {
    const m2 = Number(raw.propertySizeM2 ?? raw.property_size_m2);
    return calculateOrderPrice({
      serviceType: "move_in_out",
      details: {
        propertySizeM2: m2,
        packageType: String(raw.packageType ?? raw.package_type ?? "standard"),
        ovenCleaning: Boolean(raw.ovenCleaning ?? raw.oven_cleaning),
        fridgeCleaning: Boolean(raw.fridgeCleaning ?? raw.fridge_cleaning),
        insideCabinets: Boolean(raw.insideCabinets ?? raw.inside_cabinets),
        windowsInside: Boolean(raw.windowsInside ?? raw.windows_inside),
        balconyIncluded: Boolean(
          raw.balconyIncluded ?? raw.balcony_included
        ),
      },
    });
  }

  if (serviceType === "office_cleaning") {
    const m2 = Number(raw.officeSizeM2 ?? raw.office_size_m2);
    return calculateOrderPrice({
      serviceType: "office_cleaning",
      details: { officeSizeM2: m2 },
    });
  }

  return null;
}
