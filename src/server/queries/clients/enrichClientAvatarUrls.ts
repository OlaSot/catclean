import type { AdminClient } from "@/entities/client/admin-client.types";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { resolveAvatarDisplayUrl } from "@/lib/storage/avatar-display-url";

export async function enrichClientAvatarUrls(
  clients: AdminClient[]
): Promise<AdminClient[]> {
  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return clients;
  }

  return Promise.all(
    clients.map(async (client) => {
      if (!client.avatarUrl) return client;

      const displayUrl = await resolveAvatarDisplayUrl(
        admin.supabase!,
        client.avatarUrl
      );

      return {
        ...client,
        avatarUrl: displayUrl,
      };
    })
  );
}
