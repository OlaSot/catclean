import { isClientType, type ClientType } from "@/lib/constants/client-type";
import type { AdminClientsFilters } from "@/server/queries/clients/admin-clients-filters";

export function parseAdminClientsQuery(
  searchParams: URLSearchParams
): AdminClientsFilters {
  const filters: AdminClientsFilters = {};

  const search = searchParams.get("search")?.trim();
  if (search) {
    filters.search = search;
  }

  const clientTypeRaw = searchParams.get("client_type")?.trim().toLowerCase();
  if (clientTypeRaw && clientTypeRaw !== "all") {
    if (isClientType(clientTypeRaw)) {
      filters.clientType = clientTypeRaw as ClientType;
    }
  }

  return filters;
}
