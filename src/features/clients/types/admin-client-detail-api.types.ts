import type { AdminClient } from "@/entities/client/admin-client.types";

export type AdminClientDetailApiResponse = {
  data: AdminClient | null;
  error: string | null;
};
