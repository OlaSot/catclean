import type { ComplaintStatus } from "@/lib/constants/complaint";

export type AdminComplaintListItem = {
  id: string;
  orderId: string;
  orderDisplayId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  status: ComplaintStatus;
  statusLabel: string;
  reason: string;
  reasonLabel: string;
  description: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};
