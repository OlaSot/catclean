export const AVATAR_BUCKET = "avatars";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AvatarMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number];

export function extensionForAvatarMime(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export function validateAvatarFile(
  mime: string,
  size: number
): { ok: true; mime: AvatarMimeType } | { ok: false; error: string } {
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(mime as AvatarMimeType)) {
    return {
      ok: false,
      error: "Only JPEG, PNG and WebP images are allowed",
    };
  }

  if (size > AVATAR_MAX_BYTES) {
    return { ok: false, error: "Image must be 2MB or smaller" };
  }

  if (size <= 0) {
    return { ok: false, error: "File is empty" };
  }

  return { ok: true, mime: mime as AvatarMimeType };
}

export function buildCleanerAvatarStoragePath(
  cleanerId: string,
  ext: string
): string {
  return `cleaners/${cleanerId}/avatar-${Date.now()}.${ext}`;
}
