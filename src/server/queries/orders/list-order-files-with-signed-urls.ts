import {
  mapAdminOrderFile,
  type SupabaseOrderFileRow,
} from "@/entities/order/map-admin-order-file";
import type { AdminOrderFile } from "@/features/orders/types/admin-order-files-api.types";
import { createOrderFileSignedUrl } from "@/lib/storage/order-file-signed-url";
import type { SupabaseClient } from "@supabase/supabase-js";

async function attachSignedUrls(
  adminSupabase: SupabaseClient,
  rows: SupabaseOrderFileRow[],
  profileMap: Map<
    string,
    { id: string; email: string | null; full_name: string | null; role: string | null }
  >
): Promise<AdminOrderFile[]> {
  const files: AdminOrderFile[] = [];

  for (const row of rows) {
    const signedUrl = await createOrderFileSignedUrl(adminSupabase, row.file_path);
    const uploader = row.uploaded_by
      ? (profileMap.get(row.uploaded_by) ?? null)
      : null;
    files.push(mapAdminOrderFile(row, signedUrl, uploader));
  }

  return files;
}

export async function listOrderFilesWithSignedUrls(
  adminSupabase: SupabaseClient,
  orderId: string
): Promise<{ files: AdminOrderFile[]; error: string | null }> {
  const { data: rows, error } = await adminSupabase
    .from("order_files")
    .select(
      "id, order_id, uploaded_by, file_path, file_name, file_type, file_size, category, created_at"
    )
    .eq("order_id", orderId.trim())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listOrderFilesWithSignedUrls:", error);
    return { files: [], error: error.message };
  }

  const fileRows = (rows ?? []) as SupabaseOrderFileRow[];
  const profileIds = [
    ...new Set(
      fileRows
        .map((row) => row.uploaded_by)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const profileMap = new Map<
    string,
    { id: string; email: string | null; full_name: string | null; role: string | null }
  >();

  if (profileIds.length > 0) {
    const { data: profiles, error: profilesError } = await adminSupabase
      .from("profiles")
      .select("id, email, full_name, role")
      .in("id", profileIds);

    if (profilesError) {
      console.error("listOrderFilesWithSignedUrls profiles:", profilesError);
    } else {
      for (const profile of profiles ?? []) {
        profileMap.set(profile.id, profile);
      }
    }
  }

  const files = await attachSignedUrls(adminSupabase, fileRows, profileMap);
  return { files, error: null };
}
