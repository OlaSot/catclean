import { normalizeClientType } from "@/lib/constants/client-type";
import type { AdminClient } from "./admin-client.types";
import type { ClientOrderStats } from "@/entities/order/order.supabase.types";

type SupabaseClientProfileRow = {
  client_type: string | null;
  company_name: string | null;
  internal_note: string | null;
};

type SupabaseProfileFields = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
};

type SupabaseProfileWithClientRow = SupabaseProfileFields & {
  role: string | null;
  client_profiles?:
    | SupabaseClientProfileRow
    | SupabaseClientProfileRow[]
    | null;
};

type SupabaseClientProfileWithProfileRow = SupabaseClientProfileRow & {
  profile?: SupabaseProfileWithClientRow | SupabaseProfileWithClientRow[] | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function buildAdminClient(
  profile: SupabaseProfileFields,
  clientProfile: SupabaseClientProfileRow | null,
  stats: ClientOrderStats
): AdminClient {
  const name =
    profile.full_name?.trim() ||
    profile.email?.trim() ||
    profile.phone?.trim() ||
    "Unknown client";

  return {
    id: profile.id,
    name,
    email: profile.email?.trim() || "—",
    phone: profile.phone?.trim() || "—",
    avatarUrl: profile.avatar_url?.trim() || null,
    clientType: normalizeClientType(clientProfile?.client_type),
    companyName: clientProfile?.company_name?.trim() || null,
    internalNote: clientProfile?.internal_note?.trim() || null,
    ordersCount: stats.ordersCount,
    lastOrderDate: stats.lastOrderDateISO ?? null,
  };
}

const EMPTY_STATS: ClientOrderStats = { ordersCount: 0 };

export function mapProfileToAdminClient(
  row: SupabaseProfileWithClientRow,
  stats: ClientOrderStats = EMPTY_STATS
): AdminClient | null {
  if (!row.id || row.role !== "client") return null;

  const clientProfile = unwrapRelation(row.client_profiles);
  return buildAdminClient(row, clientProfile, stats);
}

export function mapAdminClientRow(
  row: SupabaseClientProfileWithProfileRow,
  stats: ClientOrderStats = EMPTY_STATS
): AdminClient | null {
  const profile = unwrapRelation(row.profile);
  if (!profile?.id || profile.role !== "client") return null;

  return buildAdminClient(profile, row, stats);
}
