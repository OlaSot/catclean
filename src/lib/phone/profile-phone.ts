import type { SupabaseClient } from "@supabase/supabase-js";
import { isValidPhone, normalizePhone } from "@/lib/phone/normalize-phone";

export const PHONE_FORM_HINT = "Use German phone format";
export const PHONE_FORM_EXAMPLE = "+49 178 1234567";

export const INVALID_PHONE_MESSAGE =
  "Enter a valid German phone number (e.g. +49 178 1234567)";

export const DUPLICATE_PHONE_MESSAGE =
  "A profile with this phone number already exists";

export type ProfilePhoneFields = {
  phone: string;
  phoneNormalized: string;
};

export type ValidateProfilePhoneResult =
  | { ok: true; fields: ProfilePhoneFields }
  | { ok: false; error: string };

export function validateProfilePhone(raw: string): ValidateProfilePhoneResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Phone is required" };
  }

  const phoneNormalized = normalizePhone(trimmed);
  if (!phoneNormalized || !isValidPhone(trimmed)) {
    return { ok: false, error: INVALID_PHONE_MESSAGE };
  }

  return {
    ok: true,
    fields: {
      phone: phoneNormalized,
      phoneNormalized,
    },
  };
}

export function isPhoneNormalizedDuplicateError(
  error: string | { code?: string; message?: string } | null | undefined
): boolean {
  if (!error) return false;
  const message =
    typeof error === "string" ? error : (error.message ?? "");
  const code = typeof error === "string" ? undefined : error.code;
  const msg = message.toLowerCase();
  return (
    msg.includes("phone_normalized") ||
    (code === "23505" && msg.includes("phone"))
  );
}

export async function findProfileIdByNormalizedPhone(
  supabase: SupabaseClient,
  phoneNormalized: string
): Promise<{
  profileId: string | null;
  role: string | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("phone_normalized", phoneNormalized)
    .maybeSingle();

  if (error) {
    return { profileId: null, role: null, error: error.message };
  }

  return {
    profileId: (data?.id as string) ?? null,
    role: (data?.role as string) ?? null,
    error: null,
  };
}

export async function checkDuplicateProfilePhone(
  supabase: SupabaseClient,
  phoneNormalized: string,
  excludeProfileId?: string
): Promise<{ duplicate: boolean; error: string | null }> {
  let query = supabase
    .from("profiles")
    .select("id")
    .eq("phone_normalized", phoneNormalized)
    .limit(1);

  if (excludeProfileId) {
    query = query.neq("id", excludeProfileId);
  }

  const { data, error } = await query;

  if (error) {
    return { duplicate: false, error: error.message };
  }

  return { duplicate: (data?.length ?? 0) > 0, error: null };
}
