import type { CleanerOrderFile } from "@/features/orders/types/cleaner-order-files-api.types";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { fetchCleanerOwnedOrder } from "@/server/mutations/orders/cleaner-order-access";
import { listOrderFilesWithSignedUrls } from "@/server/queries/orders/list-order-files-with-signed-urls";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCleanerOrderFiles(
  userSupabase: SupabaseClient,
  orderId: string,
  cleanerId: string
): Promise<{
  files: CleanerOrderFile[];
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
}> {
  const access = await fetchCleanerOwnedOrder(userSupabase, orderId, cleanerId);
  if (!access.ok) {
    return {
      files: [],
      error: access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
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

  if (error) {
    return { files: [], error };
  }

  const cleanerFiles: CleanerOrderFile[] = files.map((file) => ({
    ...file,
    canDelete: file.uploadedBy?.id === cleanerId.trim(),
  }));

  return { files: cleanerFiles, error: null };
}
