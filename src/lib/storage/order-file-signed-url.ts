import type { SupabaseClient } from "@supabase/supabase-js";
import { ORDER_FILES_BUCKET } from "@/lib/storage/order-files-upload";

export const ORDER_FILE_SIGNED_URL_TTL_SEC = 60 * 60;

export async function createOrderFileSignedUrl(
  supabase: SupabaseClient,
  filePath: string
): Promise<string | null> {
  const path = filePath.trim();
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(ORDER_FILES_BUCKET)
    .createSignedUrl(path, ORDER_FILE_SIGNED_URL_TTL_SEC);

  if (error) {
    console.error("createOrderFileSignedUrl:", error);
    return null;
  }

  return data.signedUrl;
}
