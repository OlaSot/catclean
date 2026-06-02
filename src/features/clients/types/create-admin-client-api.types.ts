import type { AdminClient } from "@/entities/client/admin-client.types";

export type CreateAdminClientRequestBody = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  clientType: "private" | "business";
  companyName?: string | null;
};

export type CreateAdminClientApiResponse = {
  data: AdminClient | null;
  error: string | null;
};
