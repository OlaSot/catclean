import {
  mapAdminOrderFile,
  type SupabaseOrderFileRow,
} from "@/entities/order/map-admin-order-file";
import type { AdminOrderFile } from "@/features/orders/types/admin-order-files-api.types";
import { isOrderFileCategory } from "@/lib/constants/order-file-category";
import { ensureOrderFilesBucket } from "@/lib/storage/ensure-order-files-bucket";
import { createOrderFileSignedUrl } from "@/lib/storage/order-file-signed-url";
import {
  buildOrderFileStoragePath,
  ORDER_FILES_BUCKET,
  validateOrderFile,
} from "@/lib/storage/order-files-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { assertAdminOrderExists } from "@/server/queries/orders/order-files-access";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadAdminOrderFile(
  userSupabase: SupabaseClient,
  orderId: string,
  uploadedBy: string,
  fileBytes: Uint8Array,
  mimeType: string,
  fileName: string,
  categoryRaw: string
): Promise<{
  file: AdminOrderFile | null;
  error: string | null;
  notFound?: boolean;
}> {
  const id = orderId.trim();
  const category = categoryRaw.trim();

  if (!isOrderFileCategory(category)) {
    return { file: null, error: "Invalid file category" };
  }

  const access = await assertAdminOrderExists(userSupabase, id);
  if (!access.ok) {
    return {
      file: null,
      error: access.notFound ? "Order not found" : access.error,
      notFound: access.notFound,
    };
  }

  const validation = validateOrderFile(mimeType, fileBytes.byteLength);
  if (!validation.ok) {
    return { file: null, error: validation.error };
  }

  const adminResult = createSupabaseAdminClient();
  if (!adminResult.supabase) {
    return { file: null, error: adminResult.error };
  }

  const adminSupabase = adminResult.supabase;

  const bucketReady = await ensureOrderFilesBucket(adminSupabase);
  if (!bucketReady.ok) {
    return { file: null, error: bucketReady.error };
  }

  const storagePath = buildOrderFileStoragePath(id, fileName);
  const safeFileName = fileName.trim() || "file";

  const { error: uploadError } = await adminSupabase.storage
    .from(ORDER_FILES_BUCKET)
    .upload(storagePath, fileBytes, {
      contentType: validation.mime,
      upsert: false,
    });

  if (uploadError) {
    console.error("uploadAdminOrderFile storage:", uploadError);
    return { file: null, error: uploadError.message };
  }

  const { data: inserted, error: insertError } = await adminSupabase
    .from("order_files")
    .insert({
      order_id: id,
      uploaded_by: uploadedBy,
      file_path: storagePath,
      file_name: safeFileName,
      file_type: validation.mime,
      file_size: fileBytes.byteLength,
      category,
    })
    .select(
      "id, order_id, uploaded_by, file_path, file_name, file_type, file_size, category, created_at"
    )
    .single();

  if (insertError || !inserted) {
    console.error("uploadAdminOrderFile insert:", insertError);
    await adminSupabase.storage.from(ORDER_FILES_BUCKET).remove([storagePath]);
    return { file: null, error: insertError?.message ?? "Failed to save file record" };
  }

  const row = inserted as SupabaseOrderFileRow;

  const { data: uploader } = await adminSupabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", uploadedBy)
    .maybeSingle();

  const signedUrl = await createOrderFileSignedUrl(adminSupabase, row.file_path);

  return {
    file: mapAdminOrderFile(row, signedUrl, uploader ?? null),
    error: null,
  };
}
