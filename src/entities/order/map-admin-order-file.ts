import {
  getOrderFileCategoryLabel,
  type OrderFileCategory,
} from "@/lib/constants/order-file-category";
import { isOrderFileImageMime } from "@/lib/storage/order-files-upload";
import type { AdminOrderFile } from "@/features/orders/types/admin-order-files-api.types";

export type SupabaseOrderFileRow = {
  id: string;
  order_id: string;
  uploaded_by: string | null;
  file_path: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  category: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
};

export function mapAdminOrderFile(
  row: SupabaseOrderFileRow,
  signedUrl: string | null,
  uploader: ProfileRow | null
): AdminOrderFile {
  const fileType = row.file_type?.trim() || "application/octet-stream";
  const category = row.category as OrderFileCategory;

  return {
    id: row.id,
    orderId: row.order_id,
    filePath: row.file_path,
    fileName: row.file_name?.trim() || "file",
    fileType,
    fileSize: row.file_size ?? 0,
    category,
    categoryLabel: getOrderFileCategoryLabel(category),
    createdAt: row.created_at,
    uploadedBy: uploader
      ? {
          id: uploader.id,
          email: uploader.email?.trim() || "—",
          fullName: uploader.full_name?.trim() || null,
          role: uploader.role?.trim() || null,
        }
      : null,
    signedUrl,
    isImage: isOrderFileImageMime(fileType),
  };
}
