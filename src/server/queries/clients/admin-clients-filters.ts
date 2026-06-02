import type { ClientType } from "@/lib/constants/client-type";
import type { AdminClient } from "@/entities/client/admin-client.types";

export type AdminClientsFilters = {
  search?: string;
  clientType?: "all" | ClientType;
};

export function applyAdminClientsFilters(
  clients: AdminClient[],
  filters: AdminClientsFilters
): AdminClient[] {
  let result = clients;

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    result = result.filter((client) => {
      const haystack = [client.name, client.email, client.phone]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (filters.clientType && filters.clientType !== "all") {
    result = result.filter(
      (client) =>
        (client.clientType ?? "").toLowerCase() === filters.clientType
    );
  }

  return result;
}
