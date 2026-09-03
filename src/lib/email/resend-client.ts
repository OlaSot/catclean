import { Resend } from "resend";

const TEST_FROM = "CatClean <onboarding@resend.dev>";

export function isBookingEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getBookingEmailFrom(): string {
  return process.env.RESEND_FROM?.trim() || TEST_FROM;
}

export function getEmailDeliveryTo(intendedTo: string, from: string): string {
  const normalizedTo = intendedTo.trim().toLowerCase();
  const resendTestTo = process.env.RESEND_TEST_TO?.trim().toLowerCase();
  return resendTestTo && /<onboarding@resend\.dev>$/i.test(from)
    ? resendTestTo
    : normalizedTo;
}

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}
