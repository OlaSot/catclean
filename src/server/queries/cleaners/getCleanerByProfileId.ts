import { mapProfileToAdminCleaner } from "@/entities/cleaner/active-cleaner.mapper";
import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

const CLEANER_BY_ID_SELECT = `
  id,
  full_name,
  email,
  phone,
  avatar_url,
  role,
  cleaner_profiles (
    id,
    profile_id,
    status,
    base_city,
    rating,
    pet_friendly,
    owns_vacuum,
    owns_steam_cleaner,
    accepts_windows,
    accepts_dry_cleaning
  )
`;

export async function getCleanerByProfileId(profileId: string): Promise<{
  cleaner: ActiveCleaner | null;
  error: string | null;
}> {
  const id = profileId.trim();
  if (!id) {
    return { cleaner: null, error: "Invalid cleaner id" };
  }

  const admin = createSupabaseAdminClient();
  const supabase = admin.supabase ?? (await createSupabaseServerClient());

  const { data: row, error } = await supabase
    .from("profiles")
    .select(CLEANER_BY_ID_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getCleanerByProfileId:", error);
    return { cleaner: null, error: error.message };
  }

  if (!row) {
    return { cleaner: null, error: "Cleaner not found" };
  }

  const cleaner = mapProfileToAdminCleaner(
    row as Parameters<typeof mapProfileToAdminCleaner>[0]
  );

  if (!cleaner) {
    return { cleaner: null, error: "Profile is not a cleaner" };
  }

  return { cleaner, error: null };
}
