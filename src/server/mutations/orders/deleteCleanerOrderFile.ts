import { ORDER_FILES_BUCKET } from "@/lib/storage/order-files-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { fetchCleanerOwnedOrder } from "@/server/mutations/orders/cleaner-order-access";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteCleanerOrderFile(
  userSupabase: SupabaseClient,
  orderId: string,
  cleanerId: string,
  fileId: string
): Promise<{
  deletedId: string | null;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
  fileNotFound?: boolean;
}> {
  const oid = orderId.trim();
  const fid = fileId.trim();
  const cleaner = cleanerId.trim();

  if (!fid) {
    return { deletedId: null, error: "Invalid file id" };
  }

  const access = await fetchCleanerOwnedOrder(userSupabase, oid, cleaner);
  if (!access.ok) {
    return {
      deletedId: null,
      error: access.notFound ? "Order not found" : access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  const adminResult = createSupabaseAdminClient();
  if (!adminResult.supabase) {
    return { deletedId: null, error: adminResult.error };
  }

  const adminSupabase = adminResult.supabase;

  const { data: row, error: fetchError } = await adminSupabase
    .from("order_files")
    .select("id, file_path, uploaded_by")
    .eq("id", fid)
    .eq("order_id", oid)
    .maybeSingle();

  if (fetchError) {
    console.error("deleteCleanerOrderFile fetch:", fetchError);
    return { deletedId: null, error: fetchError.message };
  }

  if (!row?.id) {
    return { deletedId: null, error: null, fileNotFound: true };
  }

  const uploadedBy = (row as { uploaded_by: string | null }).uploaded_by;
  if (uploadedBy !== cleaner) {
    return {
      deletedId: null,
      error: "You can only delete files you uploaded",
      forbidden: true,
    };
  }

  const filePath = (row as { file_path: string }).file_path;

  const { error: storageError } = await adminSupabase.storage
    .from(ORDER_FILES_BUCKET)
    .remove([filePath]);

  if (storageError) {
    console.error("deleteCleanerOrderFile storage:", storageError);
    return { deletedId: null, error: storageError.message };
  }

  const { error: deleteError } = await adminSupabase
    .from("order_files")
    .delete()
    .eq("id", fid)
    .eq("order_id", oid)
    .eq("uploaded_by", cleaner);

  if (deleteError) {
    console.error("deleteCleanerOrderFile delete:", deleteError);
    return { deletedId: null, error: deleteError.message };
  }

  return { deletedId: fid, error: null };
}
