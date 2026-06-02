import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ORDER_FILE_ALLOWED_MIME_TYPES,
  ORDER_FILES_BUCKET,
  ORDER_FILE_MAX_BYTES,
} from "@/lib/storage/order-files-upload";

export function formatOrderFilesStorageError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("bucket not found") || lower.includes("bucket does not exist")) {
    return (
      `Storage bucket "${ORDER_FILES_BUCKET}" was not found. ` +
      `Create a **private** bucket named "${ORDER_FILES_BUCKET}" in Supabase Storage, ` +
      "or ensure SUPABASE_SERVICE_ROLE_KEY is set so the API can create it automatically."
    );
  }
  return message;
}

/** Ensures the private order-files bucket exists (service role required). */
export async function ensureOrderFilesBucket(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (!listError && buckets?.some((bucket) => bucket.name === ORDER_FILES_BUCKET)) {
    return { ok: true };
  }

  if (listError) {
    console.warn("ensureOrderFilesBucket listBuckets:", listError);
  }

  const { error: createError } = await supabase.storage.createBucket(
    ORDER_FILES_BUCKET,
    {
      public: false,
      fileSizeLimit: ORDER_FILE_MAX_BYTES,
      allowedMimeTypes: [...ORDER_FILE_ALLOWED_MIME_TYPES],
    }
  );

  if (!createError) {
    return { ok: true };
  }

  const createMsg = createError.message.toLowerCase();
  if (createMsg.includes("already exists") || createMsg.includes("duplicate")) {
    return { ok: true };
  }

  console.error("ensureOrderFilesBucket createBucket:", createError);
  return {
    ok: false,
    error: formatOrderFilesStorageError(createError.message),
  };
}
