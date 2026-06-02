import type { Order } from "@/entities/order/order.types";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";

function parseOrderId(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

/** Ensures API JSON orders match Order shape (id from orders.id, draftId nullable). */
export function normalizeOrdersFromApi(payload: unknown): Order[] {
  if (!Array.isArray(payload)) return [];

  return payload.map((item) => {
    const raw = item as Partial<Order>;
    const orderNumber = raw.orderNumber ?? null;
    const parsedId = parseOrderId(raw.id);
    const routeId =
      typeof raw.routeId === "string" && raw.routeId.trim()
        ? raw.routeId.trim()
        : String(raw.id ?? parsedId);

    return {
      ...raw,
      id: parsedId,
      routeId,
      displayId:
        raw.displayId ??
        formatOrderDisplayId(raw.id ?? routeId ?? parsedId, orderNumber),
      orderNumber,
      draftId: raw.draftId ?? null,
      rooms: Array.isArray(raw.rooms) ? raw.rooms : [],
      assigned: raw.assigned ?? { cleanersNeeded: 0, cleaners: [] },
      customer: raw.customer ?? {
        name: "—",
        email: "—",
        phone: "—",
        ordersCount: 0,
      },
      address: raw.address ?? { street: "—", house: "—" },
      pricing: raw.pricing ?? {
        base: 0,
        discountPercent: 0,
        total: 0,
        currency: "EUR",
      },
      payment: raw.payment ?? { method: "After", status: "unpaid" },
    } as Order;
  });
}
