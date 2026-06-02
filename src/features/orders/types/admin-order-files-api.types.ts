import type { OrderFileCategory } from "@/lib/constants/order-file-category";

export type AdminOrderFileUploader = {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
};

export type AdminOrderFile = {
  id: string;
  orderId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: OrderFileCategory;
  categoryLabel: string;
  createdAt: string;
  uploadedBy: AdminOrderFileUploader | null;
  signedUrl: string | null;
  isImage: boolean;
};

export type AdminOrderFilesListApiResponse = {
  data: AdminOrderFile[] | null;
  error: string | null;
};

export type AdminOrderFileUploadApiResponse = {
  data: AdminOrderFile | null;
  error: string | null;
};

export type AdminOrderFileDeleteApiResponse = {
  data: { id: string } | null;
  error: string | null;
};
