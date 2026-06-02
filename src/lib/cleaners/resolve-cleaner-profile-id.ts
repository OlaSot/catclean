import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolveCleanerProfileIdResult =
  | { profileId: string; resolvedFrom: "profiles.id" | "cleaner_profiles.profile_id" }
  | { error: string };

/**
 * Always resolves to profiles.id (auth.users.id).
 * If cleaner_profiles.id was passed by mistake, maps via profile_id.
 */
export async function resolveCleanerProfileId(
  supabase: SupabaseClient,
  cleanerId: string
): Promise<ResolveCleanerProfileIdResult> {
  const id = cleanerId.trim();
  if (!id) {
    return { error: "Invalid cleaner id" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();

  if (profileError) {
    console.error("resolveCleanerProfileId profiles:", profileError);
    return { error: profileError.message };
  }

  if (profile?.role === "cleaner") {
    return { profileId: profile.id, resolvedFrom: "profiles.id" };
  }

  const { data: cleanerProfile, error: cpError } = await supabase
    .from("cleaner_profiles")
    .select("id, profile_id")
    .or(`id.eq.${id},profile_id.eq.${id}`)
    .maybeSingle();

  if (cpError) {
    console.error("resolveCleanerProfileId cleaner_profiles:", cpError);
    return { error: cpError.message };
  }

  if (!cleanerProfile?.profile_id) {
    return { error: "Cleaner not found" };
  }

  const { data: linkedProfile, error: linkedError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", cleanerProfile.profile_id)
    .maybeSingle();

  if (linkedError) {
    console.error("resolveCleanerProfileId linked profile:", linkedError);
    return { error: linkedError.message };
  }

  if (!linkedProfile || linkedProfile.role !== "cleaner") {
    return { error: "Profile is not a cleaner" };
  }

  if (cleanerProfile.id === id && cleanerProfile.profile_id !== id) {
    console.warn(
      "[resolveCleanerProfileId] Received cleaner_profiles.id; using profile_id for assignment",
      { cleaner_profiles_id: id, profile_id: cleanerProfile.profile_id }
    );
  }

  return {
    profileId: cleanerProfile.profile_id,
    resolvedFrom: "cleaner_profiles.profile_id",
  };
}
