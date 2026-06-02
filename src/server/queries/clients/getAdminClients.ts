import {
  mapAdminClientRow,
  mapProfileToAdminClient,
} from "@/entities/client/admin-client.mapper";
import type { AdminClient } from "@/entities/client/admin-client.types";
import type { ClientOrderStats } from "@/entities/order/order.supabase.types";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { buildClientOrderStats } from "@/server/queries/orders/order-client-stats";
import {
  applyAdminClientsFilters,
  type AdminClientsFilters,
} from "@/server/queries/clients/admin-clients-filters";
import { enrichClientAvatarUrls } from "@/server/queries/clients/enrichClientAvatarUrls";

export const PROFILE_CLIENT_SELECT = `
  id,
  full_name,
  email,
  phone,
  avatar_url,
  role,
  client_profiles (
    client_type,
    company_name,
    internal_note
  )
`;

export const CLIENT_PROFILE_SELECT = `
  client_type,
  company_name,
  internal_note,
  profile:profiles (
    id,
    full_name,
    email,
    phone,
    avatar_url,
    role
  )
`;

const EMPTY_STATS: ClientOrderStats = { ordersCount: 0 };

function sortClients(clients: AdminClient[]): AdminClient[] {
  return [...clients].sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadClientOrderStatsMap(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<Map<string, ClientOrderStats>> {
  const { data: rows, error } = await supabase
    .from("orders")
    .select("client_id, scheduled_date");

  if (error) {
    console.error("loadClientOrderStatsMap:", error);
    return new Map();
  }

  return buildClientOrderStats(rows ?? []);
}

function mapAllClientsFromProfiles(
  profileRows: unknown[],
  statsMap: Map<string, ClientOrderStats>
): AdminClient[] {
  return profileRows
    .map((row) => {
      const profileRow = row as Parameters<typeof mapProfileToAdminClient>[0];
      const stats = statsMap.get(profileRow.id) ?? EMPTY_STATS;
      return mapProfileToAdminClient(profileRow, stats);
    })
    .filter((item): item is AdminClient => Boolean(item));
}

async function loadAllAdminClients(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  statsMap: Map<string, ClientOrderStats>
): Promise<{ clients: AdminClient[]; error: string | null }> {
  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_CLIENT_SELECT)
    .eq("role", "client");

  let clients: AdminClient[] = [];

  if (!profileError && profileRows?.length) {
    clients = mapAllClientsFromProfiles(profileRows, statsMap);
  }

  if (profileError) {
    console.error("getAdminClients profiles:", profileError);
  }

  if (clients.length === 0) {
    const { data: clientRows, error: clientError } = await supabase
      .from("client_profiles")
      .select(CLIENT_PROFILE_SELECT)
      .order("company_name", { ascending: true, nullsFirst: false });

    if (clientError) {
      console.error("getAdminClients client_profiles:", clientError);
      return {
        clients: [],
        error: profileError?.message ?? clientError.message,
      };
    }

    clients = sortClients(
      (clientRows ?? [])
        .map((row) => {
          const typed = row as Parameters<typeof mapAdminClientRow>[0];
          const profile = typed.profile;
          const profileRow = Array.isArray(profile) ? profile[0] : profile;
          const stats = profileRow?.id
            ? (statsMap.get(profileRow.id) ?? EMPTY_STATS)
            : EMPTY_STATS;
          return mapAdminClientRow(typed, stats);
        })
        .filter((item): item is AdminClient => Boolean(item))
    );
  }

  return { clients: sortClients(clients), error: null };
}

export async function getAdminClients(
  filters: AdminClientsFilters = {}
): Promise<{
  clients: AdminClient[];
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  const statsMap = await loadClientOrderStatsMap(supabase);
  const { clients, error } = await loadAllAdminClients(supabase, statsMap);

  if (error) {
    return { clients: [], error };
  }

  const filtered = applyAdminClientsFilters(clients, filters);
  const enriched = await enrichClientAvatarUrls(sortClients(filtered));

  return { clients: enriched, error: null };
}

export async function getAdminClientById(
  profileId: string
): Promise<{ client: AdminClient | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const statsMap = await loadClientOrderStatsMap(supabase);
  const stats = statsMap.get(profileId) ?? EMPTY_STATS;

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_CLIENT_SELECT)
    .eq("id", profileId)
    .eq("role", "client")
    .maybeSingle();

  if (profileError) {
    console.error("getAdminClientById profile:", profileError);
    return { client: null, error: profileError.message };
  }

  let client = profileRow
    ? mapProfileToAdminClient(
        profileRow as Parameters<typeof mapProfileToAdminClient>[0],
        stats
      )
    : null;

  if (!client) {
    const { data: clientRow, error: clientError } = await supabase
      .from("client_profiles")
      .select(CLIENT_PROFILE_SELECT)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (clientError) {
      console.error("getAdminClientById client_profiles:", clientError);
      return { client: null, error: clientError.message };
    }

    client = clientRow
      ? mapAdminClientRow(
          clientRow as Parameters<typeof mapAdminClientRow>[0],
          stats
        )
      : null;
  }

  if (!client) {
    return { client: null, error: null };
  }

  const [enriched] = await enrichClientAvatarUrls([client]);
  return { client: enriched ?? client, error: null };
}
