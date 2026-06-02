/** Order statuses where admin/operator may assign or reassign a cleaner. */
export const CLEANER_ASSIGNMENT_ALLOWED_STATUSES = [
  "new",
  "waiting_for_payment",
  "paid",
  "searching_cleaner",
  "cleaner_assigned",
  "confirmed",
] as const;

/** Order statuses where cleaner assignment must be disabled. */
export const CLEANER_ASSIGNMENT_DISABLED_STATUSES = [
  "in_progress",
  "problem",
  "completed",
  "cancelled_by_client",
  "cancelled_by_cleaner",
  "cancelled_by_admin",
  "refunded",
  "canceled",
  "cancelled",
] as const;

function normalizeStatusKey(status: string | null | undefined): string {
  return (status ?? "").toLowerCase().replace(/-/g, "_");
}

/**
 * Whether a cleaner may be assigned based on **orders.status** only.
 * payment_status (unpaid, paid, card_hold) never affects this result.
 */
export function canAssignCleanerToOrder(
  orderStatus: string | null | undefined
): boolean {
  const key = normalizeStatusKey(orderStatus);

  if (
    (CLEANER_ASSIGNMENT_DISABLED_STATUSES as readonly string[]).includes(key)
  ) {
    return false;
  }

  return (CLEANER_ASSIGNMENT_ALLOWED_STATUSES as readonly string[]).includes(
    key
  );
}

/**
 * Same as {@link canAssignCleanerToOrder}; accepts an order row but ignores
 * payment_status so it cannot accidentally gate assignment on payment.
 */
export function canAssignCleanerForOrder(order: {
  status: string | null | undefined;
  payment_status?: string | null | undefined;
}): boolean {
  void order.payment_status;
  return canAssignCleanerToOrder(order.status);
}

export function cleanerAssignmentUnavailableMessage(
  statusLabel: string,
  statusRaw: string
): string {
  return (
    `Cleaner assignment is not available for order status "${statusLabel}". ` +
    "Allowed order statuses: new, waiting for payment, paid, searching cleaner, " +
    "cleaner assigned, confirmed. " +
    "Payment status (including unpaid) does not block assignment. " +
    `(Current order status: ${statusRaw})`
  );
}
