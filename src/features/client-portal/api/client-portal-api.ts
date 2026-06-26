import type { ClientOrdersApiResponse } from "@/features/orders/types/client-orders-api.types";
import type { ClientOrderDetailApiResponse } from "@/features/orders/types/client-orders-api.types";
import type {
  ClientCancelOrderApiResponse,
  ClientRescheduleApiResponse,
} from "@/features/orders/types/client-orders-api.types";
import type {
  ClientComplaintApiResponse,
  ClientReviewApiResponse,
} from "@/features/orders/types/client-review-complaint-api.types";
import type {
  NotificationsApiResponse,
  NotificationMarkReadApiResponse,
  NotificationsReadAllApiResponse,
} from "@/features/notifications/types/notifications-api.types";
import type {
  PortalClientProfile,
  PortalPreferredCleaner,
  PortalSavedAddress,
} from "../types/portal.types";

export type ClientProfileApiResponse = {
  data: PortalClientProfile | null;
  error: string | null;
};

export type ClientPreferredCleanerApiResponse = {
  data: PortalPreferredCleaner | null;
  error: string | null;
};

export type ClientAddressesApiResponse = {
  data: PortalSavedAddress[] | null;
  error: string | null;
};

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function fetchClientOrders() {
  const response = await fetch("/api/client/orders", { credentials: "include" });
  const json = await parseJson<ClientOrdersApiResponse>(response);
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed to load orders");
  }
  return json.data ?? [];
}

export async function fetchClientOrderDetail(orderId: string) {
  const response = await fetch(`/api/client/orders/${orderId}`, {
    credentials: "include",
  });
  const json = await parseJson<ClientOrderDetailApiResponse>(response);
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed to load order");
  }
  return json.data;
}

export async function fetchClientProfile() {
  const response = await fetch("/api/client/profile", { credentials: "include" });
  const json = await parseJson<ClientProfileApiResponse>(response);
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed to load profile");
  }
  return json.data;
}

export async function fetchClientAddresses() {
  const response = await fetch("/api/client/addresses", { credentials: "include" });
  const json = await parseJson<ClientAddressesApiResponse>(response);
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed to load addresses");
  }
  return json.data ?? [];
}

export async function fetchPreferredCleaner() {
  const response = await fetch("/api/client/preferred-cleaner", {
    credentials: "include",
  });
  const json = await parseJson<ClientPreferredCleanerApiResponse>(response);
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed to load preferred cleaner");
  }
  return json.data;
}

export async function fetchNotifications() {
  const response = await fetch("/api/notifications", { credentials: "include" });
  const json = await parseJson<NotificationsApiResponse>(response);
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed to load notifications");
  }
  return json.data ?? [];
}

export async function fetchUnreadNotificationCount() {
  const response = await fetch("/api/notifications?unread=true", {
    credentials: "include",
  });
  const json = await parseJson<NotificationsApiResponse>(response);
  if (!response.ok || json.error) return 0;
  return json.data?.length ?? 0;
}

export async function markNotificationRead(id: string) {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "include",
  });
  const json = await parseJson<NotificationMarkReadApiResponse>(response);
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed to mark notification as read");
  }
}

export async function markAllNotificationsRead() {
  const response = await fetch("/api/notifications/read-all", {
    method: "PATCH",
    credentials: "include",
  });
  const json = await parseJson<NotificationsReadAllApiResponse>(response);
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed to mark all as read");
  }
}

export async function cancelClientOrder(orderId: string) {
  const response = await fetch(`/api/client/orders/${orderId}/cancel`, {
    method: "PATCH",
    credentials: "include",
  });
  return parseJson<ClientCancelOrderApiResponse>(response);
}

export async function requestOrderReschedule(orderId: string, message: string) {
  const response = await fetch(`/api/client/orders/${orderId}/reschedule-request`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return parseJson<ClientRescheduleApiResponse>(response);
}

export async function submitOrderReview(
  orderId: string,
  payload: { rating: number; comment?: string },
) {
  const response = await fetch(`/api/client/orders/${orderId}/review`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<ClientReviewApiResponse>(response);
}

export async function submitOrderComplaint(
  orderId: string,
  payload: { reason: string; description: string },
) {
  const response = await fetch(`/api/client/orders/${orderId}/complaint`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<ClientComplaintApiResponse>(response);
}
