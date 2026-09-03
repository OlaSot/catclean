import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export async function createOrderConfirmationToken(
  supabase: SupabaseClient,
  orderId: string,
  createdBy: string | null
): Promise<{
  token: string | null;
  expiresAt: string | null;
  error: string | null;
}> {
  const now = new Date().toISOString();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS).toISOString();

  const { error: invalidateError } = await supabase
    .from("order_confirmation_tokens")
    .update({ expires_at: now })
    .eq("order_id", orderId)
    .is("used_at", null)
    .gt("expires_at", now);

  if (invalidateError) {
    return { token: null, expiresAt: null, error: invalidateError.message };
  }

  const { error: insertError } = await supabase
    .from("order_confirmation_tokens")
    .insert({
      order_id: orderId,
      token,
      expires_at: expiresAt,
      created_by: createdBy,
    });

  if (insertError) {
    return { token: null, expiresAt: null, error: insertError.message };
  }

  return { token, expiresAt, error: null };
}

export async function invalidateActiveOrderConfirmationTokens(
  supabase: SupabaseClient,
  orderId: string
): Promise<string | null> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("order_confirmation_tokens")
    .update({ expires_at: now })
    .eq("order_id", orderId)
    .is("used_at", null)
    .gt("expires_at", now);

  return error?.message ?? null;
}
