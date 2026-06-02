import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { resolveAvatarDisplayUrl } from "@/lib/storage/avatar-display-url";

export async function enrichCleanerAvatarUrls(
  cleaners: ActiveCleaner[]
): Promise<ActiveCleaner[]> {
  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return cleaners;
  }

  return Promise.all(
    cleaners.map(async (cleaner) => {
      if (!cleaner.avatarUrl) return cleaner;

      const displayUrl = await resolveAvatarDisplayUrl(
        admin.supabase!,
        cleaner.avatarUrl
      );

      return {
        ...cleaner,
        avatarUrl: displayUrl,
      };
    })
  );
}
