import type { AdminComplaintListItem } from "@/entities/complaint/admin-complaint.types";

export type AdminComplaintsApiResponse = {
  data: AdminComplaintListItem[] | null;
  error: string | null;
};

export type AdminUpdateComplaintRequestBody = {
  status?: string;
  adminNote?: string | null;
};

export type AdminUpdateComplaintApiResponse = {
  data: AdminComplaintListItem | null;
  error: string | null;
};
