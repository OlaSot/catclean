import type { OrderFileCategory } from "@/lib/constants/order-file-category";

export const ORDER_FILES_BUCKET = "order-files";

export const ORDER_FILE_MAX_BYTES = 10 * 1024 * 1024;

export const ORDER_FILE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const CLEANER_ORDER_FILE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type OrderFileMimeType = (typeof ORDER_FILE_ALLOWED_MIME_TYPES)[number];

export type CleanerOrderFileMimeType =
  (typeof CLEANER_ORDER_FILE_ALLOWED_MIME_TYPES)[number];

export function sanitizeOrderFileName(name: string): string {
  const trimmed = name.trim();
  const base = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return (base || "file").slice(0, 160);
}

export function buildOrderFileStoragePath(
  orderId: string,
  fileName: string
): string {
  const safeName = sanitizeOrderFileName(fileName);
  return `orders/${orderId.trim()}/${Date.now()}-${safeName}`;
}

export function buildCleanerOrderFileStoragePath(
  orderId: string,
  fileName: string
): string {
  const safeName = sanitizeOrderFileName(fileName);
  return `orders/${orderId.trim()}/cleaner/${Date.now()}-${safeName}`;
}

export function validateOrderFile(
  mime: string,
  size: number
): { ok: true; mime: OrderFileMimeType } | { ok: false; error: string } {
  if (!ORDER_FILE_ALLOWED_MIME_TYPES.includes(mime as OrderFileMimeType)) {
    return {
      ok: false,
      error: "Only JPEG, PNG, WebP images and PDF documents are allowed",
    };
  }

  if (size > ORDER_FILE_MAX_BYTES) {
    return { ok: false, error: "File must be 10MB or smaller" };
  }

  if (size <= 0) {
    return { ok: false, error: "File is empty" };
  }

  return { ok: true, mime: mime as OrderFileMimeType };
}

export function validateCleanerOrderFile(
  mime: string,
  size: number
): { ok: true; mime: CleanerOrderFileMimeType } | { ok: false; error: string } {
  if (
    !CLEANER_ORDER_FILE_ALLOWED_MIME_TYPES.includes(mime as CleanerOrderFileMimeType)
  ) {
    return {
      ok: false,
      error: "Only JPEG, PNG and WebP images are allowed",
    };
  }

  if (size > ORDER_FILE_MAX_BYTES) {
    return { ok: false, error: "File must be 10MB or smaller" };
  }

  if (size <= 0) {
    return { ok: false, error: "File is empty" };
  }

  return { ok: true, mime: mime as CleanerOrderFileMimeType };
}

export function isOrderFileImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

export function isOrderFileImageCategory(category: OrderFileCategory): boolean {
  return (
    category === "before_photo" ||
    category === "after_photo" ||
    category === "damage_photo"
  );
}
