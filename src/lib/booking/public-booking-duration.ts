import { tryCalculateOrderPrice } from "@/lib/pricing/calculate-order-price";
import { normalizeJobDurationMinutes } from "@/lib/schedule/slot-overlap";

export function estimatePublicBookingDurationMinutes(input: {
  serviceType: string;
  serviceDetails: Record<string, unknown>;
  bookingProduct?: string | null;
}): number {
  const pricing = tryCalculateOrderPrice(input.serviceType, input.serviceDetails);
  let duration = normalizeJobDurationMinutes(pricing?.estimatedDurationMinutes ?? 180);

  const product = (input.bookingProduct ?? "").trim();
  const propertyType = String(
    input.serviceDetails.propertyType ?? input.serviceDetails.property_type ?? ""
  ).trim();
  if (propertyType !== "house") return duration;

  const floorsRaw = Number(
    input.serviceDetails.floorsCount ?? input.serviceDetails.floors_count ?? 1
  );
  const floorsCount =
    Number.isFinite(floorsRaw) && floorsRaw > 0 ? Math.round(floorsRaw) : 1;

  if (product === "home_reset") {
    duration += 20 + Math.max(0, floorsCount - 1) * 10;
  } else if (product === "home_care") {
    duration += 15 + Math.max(0, floorsCount - 1) * 5;
  }

  return duration;
}
