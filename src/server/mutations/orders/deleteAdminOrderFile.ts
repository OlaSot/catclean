import type { SupabaseClient } from "@supabase/supabase-js";
import { ORDER_FILES_BUCKET } from "@/lib/storage/order-files-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { assertAdminOrderExists } from "@/server/queries/orders/order-files-access";

export async function deleteAdminOrderFile(
  userSupabase: SupabaseClient,
  orderId: string,
  fileId: string
): Promise<{
  deletedId: string | null;
  error: string | null;
  notFound?: boolean;
  fileNotFound?: boolean;
}> {
  const oid = orderId.trim();
  const fid = fileId.trim();

  if (!fid) {
    return { deletedId: null, error: "Invalid file id" };
  }

  const access = await assertAdminOrderExists(userSupabase, oid);
  if (!access.ok) {
    return {
      deletedId: null,
      error: access.notFound ? "Order not found" : access.error,
      notFound: access.notFound,
    };
  }

  const adminResult = createSupabaseAdminClient();
  if (!adminResult.supabase) {
    return { deletedId: null, error: adminResult.error };
  }

  const adminSupabase = adminResult.supabase;

  const { data: row, error: fetchError } = await adminSupabase
    .from("order_files")
    .select("id, file_path")
    .eq("id", fid)
    .eq("order_id", oid)
    .maybeSingle();

  if (fetchError) {
    console.error("deleteAdminOrderFile fetch:", fetchError);
    return { deletedId: null, error: fetchError.message };
  }

  if (!row?.id) {
    return { deletedId: null, error: null, fileNotFound: true };
  }

  const filePath = (row as { file_path: string }).file_path;

  const { error: storageError } = await adminSupabase.storage
    .from(ORDER_FILES_BUCKET)
    .remove([filePath]);

  if (storageError) {
    console.error("deleteAdminOrderFile storage:", storageError);
    return { deletedId: null, error: storageError.message };
  }

  const { error: deleteError } = await adminSupabase
    .from("order_files")
    .delete()
    .eq("id", fid)
    .eq("order_id", oid);

  if (deleteError) {
    console.error("deleteAdminOrderFile delete:", deleteError);
    return { deletedId: null, error: deleteError.message };
  }

  return { deletedId: fid, error: null };
}
