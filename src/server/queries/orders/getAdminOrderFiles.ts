import type { AdminOrderFile } from "@/features/orders/types/admin-order-files-api.types";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { assertAdminOrderExists } from "@/server/queries/orders/order-files-access";
import { listOrderFilesWithSignedUrls } from "@/server/queries/orders/list-order-files-with-signed-urls";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAdminOrderFiles(
  userSupabase: SupabaseClient,
  orderId: string
): Promise<{
  files: AdminOrderFile[];
  error: string | null;
  notFound?: boolean;
}> {
  const access = await assertAdminOrderExists(userSupabase, orderId);
  if (!access.ok) {
    return {
      files: [],
      error: access.error,
      notFound: access.notFound,
    };
  }

  const adminResult = createSupabaseAdminClient();
  if (!adminResult.supabase) {
    return { files: [], error: adminResult.error };
  }

  const { files, error } = await listOrderFilesWithSignedUrls(
    adminResult.supabase,
    orderId
  );

  return { files, error };
}
