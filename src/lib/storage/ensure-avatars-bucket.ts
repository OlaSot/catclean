import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
} from "@/lib/storage/avatar-upload";

export function isBucketNotFoundMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("bucket not found") || lower.includes("bucket does not exist");
}

export function formatAvatarStorageError(message: string): string {
  if (isBucketNotFoundMessage(message)) {
    return (
      `Storage bucket "${AVATAR_BUCKET}" was not found. ` +
      `In Supabase Dashboard → Storage, create a **public** bucket named "${AVATAR_BUCKET}", ` +
      "or ensure SUPABASE_SERVICE_ROLE_KEY is set so the API can create it automatically."
    );
  }
  return message;
}

/**
 * Ensures the public "avatars" bucket exists (service role required to create).
 */
export async function ensureAvatarsBucket(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (!listError && buckets?.some((bucket) => bucket.name === AVATAR_BUCKET)) {
    return { ok: true };
  }

  if (listError) {
    console.warn("ensureAvatarsBucket listBuckets:", listError);
  }

  const { error: createError } = await supabase.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    fileSizeLimit: AVATAR_MAX_BYTES,
    allowedMimeTypes: [...AVATAR_ALLOWED_MIME_TYPES],
  });

  if (!createError) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[ensureAvatarsBucket] created bucket "${AVATAR_BUCKET}"`);
    }
    return { ok: true };
  }

  const createMsg = createError.message.toLowerCase();
  if (createMsg.includes("already exists") || createMsg.includes("duplicate")) {
    return { ok: true };
  }

  console.error("ensureAvatarsBucket createBucket:", createError);
  return {
    ok: false,
    error: formatAvatarStorageError(createError.message),
  };
}
