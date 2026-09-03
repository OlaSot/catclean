"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

export type PublicBookingResult = {
  orderId: string;
  status: string;
  confirmationPending: boolean;
  confirmationLinkReady?: boolean;
  emailSent?: boolean;
};

export function createBookingIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function translatePublicBookingError(
  t: (key: string) => string,
  error: string | null | undefined
): string {
  const message = error?.trim() || "Failed to create booking";
  if (message.startsWith("public.")) return t(message);
  return message;
}

export async function postPublicBooking(
  payload: unknown,
  idempotencyKey: string
): Promise<{ ok: true; data: PublicBookingResult } | { ok: false; error: string }> {
  const response = await fetch("/api/public/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as {
    data: PublicBookingResult | null;
    error: string | null;
  };
  if (!response.ok || body.error || !body.data) {
    return { ok: false, error: body.error ?? "Failed to create booking" };
  }
  return { ok: true, data: body.data };
}

export function usePublicBookingSubmit(options?: { returnToPortal?: boolean }) {
  const router = useRouter();
  const idempotencyKeyRef = useRef(createBookingIdempotencyKey());
  const inFlightRef = useRef(false);

  return {
    async submit(payload: unknown): Promise<
      | { ok: true; data: PublicBookingResult }
      | { ok: false; error: string; blocked?: boolean }
    > {
      if (inFlightRef.current) {
        return { ok: false, error: "", blocked: true };
      }
      inFlightRef.current = true;
      try {
        const result = await postPublicBooking(payload, idempotencyKeyRef.current);
        if (result.ok) {
          const params = new URLSearchParams({
            order: result.data.orderId,
          });
          if (result.data.emailSent) params.set("mail", "1");
          if (options?.returnToPortal) params.set("portal", "1");
          router.push(`/booking/success?${params.toString()}`);
        }
        return result;
      } finally {
        inFlightRef.current = false;
      }
    },
  };
}
