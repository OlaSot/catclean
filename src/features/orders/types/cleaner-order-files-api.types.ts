import type {
  AdminOrderFile,
  AdminOrderFileDeleteApiResponse,
} from "@/features/orders/types/admin-order-files-api.types";

export type CleanerOrderFile = AdminOrderFile & {
  canDelete: boolean;
};

export type CleanerOrderFilesListApiResponse = {
  data: CleanerOrderFile[] | null;
  error: string | null;
};

export type CleanerOrderFileUploadApiResponse = {
  data: CleanerOrderFile | null;
  error: string | null;
};

export type CleanerOrderFileDeleteApiResponse = AdminOrderFileDeleteApiResponse;
