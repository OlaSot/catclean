import type { AdminClient } from "@/entities/client/admin-client.types";

export type AdminClientsApiResponse = {
  data: AdminClient[] | null;
  error: string | null;
};
