import type { ActiveCleaner } from "@/entities/cleaner/active-cleaner.types";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import {
  ensureAvatarsBucket,
  formatAvatarStorageError,
} from "@/lib/storage/ensure-avatars-bucket";
import {
  AVATAR_BUCKET,
  buildCleanerAvatarStoragePath,
  extensionForAvatarMime,
  validateAvatarFile,
} from "@/lib/storage/avatar-upload";
import { resolveAvatarDisplayUrl } from "@/lib/storage/avatar-display-url";
import { getCleanerByProfileId } from "@/server/queries/cleaners/getCleanerByProfileId";

export async function uploadCleanerAvatar(
  profileId: string,
  fileBytes: Uint8Array,
  mimeType: string
): Promise<{ cleaner: ActiveCleaner | null; error: string | null }> {
  const id = profileId.trim();
  if (!id) {
    return { cleaner: null, error: "Invalid cleaner id" };
  }

  const validation = validateAvatarFile(mimeType, fileBytes.byteLength);
  if (!validation.ok) {
    return { cleaner: null, error: validation.error };
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return { cleaner: null, error: admin.error };
  }

  const supabase = admin.supabase;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();

  if (profileError) {
    console.error("uploadCleanerAvatar profile lookup:", profileError);
    return { cleaner: null, error: profileError.message };
  }

  if (!profile) {
    return { cleaner: null, error: "Cleaner not found" };
  }

  if (profile.role !== "cleaner") {
    return { cleaner: null, error: "Profile is not a cleaner" };
  }

  const ext = extensionForAvatarMime(validation.mime);
  if (!ext) {
    return { cleaner: null, error: "Unsupported image type" };
  }

  const bucketReady = await ensureAvatarsBucket(supabase);
  if (!bucketReady.ok) {
    return { cleaner: null, error: bucketReady.error };
  }

  const storagePath = buildCleanerAvatarStoragePath(id, ext);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, fileBytes, {
      contentType: validation.mime,
      upsert: false,
    });

  if (uploadError) {
    console.error("uploadCleanerAvatar storage:", uploadError);
    return { cleaner: null, error: formatAvatarStorageError(uploadError.message) };
  }

  const { data: publicUrlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(storagePath);

  const avatarUrl = publicUrlData.publicUrl;
  if (!avatarUrl) {
    return { cleaner: null, error: "Failed to resolve avatar URL" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", id);

  if (updateError) {
    console.error("uploadCleanerAvatar profiles update:", updateError);
    await supabase.storage.from(AVATAR_BUCKET).remove([storagePath]);
    return { cleaner: null, error: updateError.message };
  }

  const result = await getCleanerByProfileId(id);
  if (result.error || !result.cleaner) {
    return result;
  }

  const displayUrl = await resolveAvatarDisplayUrl(supabase, result.cleaner.avatarUrl);

  return {
    cleaner: {
      ...result.cleaner,
      avatarUrl: displayUrl,
    },
    error: null,
  };
}
