import type { SupabaseClient } from "@supabase/supabase-js";
import {
  checkDuplicateProfilePhone,
  DUPLICATE_PHONE_MESSAGE,
  isPhoneNormalizedDuplicateError,
  validateProfilePhone,
  type ProfilePhoneFields,
} from "@/lib/phone/profile-phone";

/**
 * Update profiles.phone and profiles.phone_normalized (E.164).
 * For future admin PATCH routes; not wired to UI yet.
 */
export async function updateProfilePhone(
  supabase: SupabaseClient,
  profileId: string,
  rawPhone: string
): Promise<{ fields: ProfilePhoneFields | null; error: string | null }> {
  const id = profileId.trim();
  if (!id) {
    return { fields: null, error: "Profile id is required" };
  }

  const validated = validateProfilePhone(rawPhone);
  if (!validated.ok) {
    return { fields: null, error: validated.error };
  }

  const duplicateCheck = await checkDuplicateProfilePhone(
    supabase,
    validated.fields.phoneNormalized,
    id
  );
  if (duplicateCheck.error) {
    return { fields: null, error: duplicateCheck.error };
  }
  if (duplicateCheck.duplicate) {
    return { fields: null, error: DUPLICATE_PHONE_MESSAGE };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      phone: validated.fields.phone,
      phone_normalized: validated.fields.phoneNormalized,
    })
    .eq("id", id);

  if (error) {
    if (isPhoneNormalizedDuplicateError(error)) {
      return { fields: null, error: DUPLICATE_PHONE_MESSAGE };
    }
    return { fields: null, error: error.message };
  }

  return { fields: validated.fields, error: null };
}
