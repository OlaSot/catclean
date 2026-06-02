import {
  mapAdminOrderFile,
  type SupabaseOrderFileRow,
} from "@/entities/order/map-admin-order-file";
import type { CleanerOrderFile } from "@/features/orders/types/cleaner-order-files-api.types";
import { isCleanerOrderFileCategory } from "@/lib/constants/cleaner-order-file-category";
import { ensureOrderFilesBucket } from "@/lib/storage/ensure-order-files-bucket";
import { createOrderFileSignedUrl } from "@/lib/storage/order-file-signed-url";
import {
  buildCleanerOrderFileStoragePath,
  ORDER_FILES_BUCKET,
  validateCleanerOrderFile,
} from "@/lib/storage/order-files-upload";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { fetchCleanerOwnedOrder } from "@/server/mutations/orders/cleaner-order-access";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadCleanerOrderFile(
  userSupabase: SupabaseClient,
  orderId: string,
  cleanerId: string,
  fileBytes: Uint8Array,
  mimeType: string,
  fileName: string,
  categoryRaw: string
): Promise<{
  file: CleanerOrderFile | null;
  error: string | null;
  notFound?: boolean;
  forbidden?: boolean;
}> {
  const id = orderId.trim();
  const category = categoryRaw.trim();

  if (!isCleanerOrderFileCategory(category)) {
    return { file: null, error: "Invalid file category" };
  }

  const access = await fetchCleanerOwnedOrder(userSupabase, id, cleanerId);
  if (!access.ok) {
    return {
      file: null,
      error: access.notFound ? "Order not found" : access.error,
      notFound: access.notFound,
      forbidden: access.forbidden,
    };
  }

  const validation = validateCleanerOrderFile(mimeType, fileBytes.byteLength);
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

  const storagePath = buildCleanerOrderFileStoragePath(id, fileName);
  const safeFileName = fileName.trim() || "file";

  const { error: uploadError } = await adminSupabase.storage
    .from(ORDER_FILES_BUCKET)
    .upload(storagePath, fileBytes, {
      contentType: validation.mime,
      upsert: false,
    });

  if (uploadError) {
    console.error("uploadCleanerOrderFile storage:", uploadError);
    return { file: null, error: uploadError.message };
  }

  const { data: inserted, error: insertError } = await adminSupabase
    .from("order_files")
    .insert({
      order_id: id,
      uploaded_by: cleanerId,
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
    console.error("uploadCleanerOrderFile insert:", insertError);
    await adminSupabase.storage.from(ORDER_FILES_BUCKET).remove([storagePath]);
    return { file: null, error: insertError?.message ?? "Failed to save file record" };
  }

  const row = inserted as SupabaseOrderFileRow;

  const { data: uploader } = await adminSupabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", cleanerId)
    .maybeSingle();

  const signedUrl = await createOrderFileSignedUrl(adminSupabase, row.file_path);

  const mapped = mapAdminOrderFile(row, signedUrl, uploader ?? null);

  return {
    file: { ...mapped, canDelete: true },
    error: null,
  };
}
