import type { SupabaseClient } from "@supabase/supabase-js";
import { AVATAR_BUCKET } from "@/lib/storage/avatar-upload";

/** Signed URLs for admin UI (works with private buckets too). */
const AVATAR_SIGNED_URL_TTL_SEC = 60 * 60 * 24 * 7;

/**
 * Extracts object path inside bucket "avatars" from a public URL or raw path.
 */
export function extractAvatarStoragePath(avatarUrl: string): string | null {
  const trimmed = avatarUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("cleaners/") || trimmed.startsWith("clients/")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const patterns = [
      /\/storage\/v1\/object\/public\/avatars\/(.+)$/,
      /\/storage\/v1\/object\/sign\/avatars\/(.+)$/,
      /\/storage\/v1\/object\/avatars\/(.+)$/,
    ];

    for (const pattern of patterns) {
      const match = url.pathname.match(pattern);
      if (match?.[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Returns a URL the browser can load (signed). Falls back to stored URL if signing fails.
 */
export async function resolveAvatarDisplayUrl(
  supabase: SupabaseClient,
  avatarUrl: string | null | undefined
): Promise<string | null> {
  const stored = avatarUrl?.trim();
  if (!stored) return null;

  const path = extractAvatarStoragePath(stored);
  if (!path) {
    return stored;
  }

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, AVATAR_SIGNED_URL_TTL_SEC);

  if (error) {
    console.warn("resolveAvatarDisplayUrl:", { path, error: error.message });
    return stored;
  }

  return data.signedUrl;
}
