import { getOrderStatusLabel } from "@/lib/constants/order-status";
import { normalizeOrderStatus } from "./order-status.utils";
import type {
  OrderStatusHistoryChangedBy,
  OrderStatusHistoryItem,
} from "./order-status-history.types";
export type SupabaseOrderStatusHistoryRow = {
  id: string;
  old_status: string | null;
  new_status: string | null;
  changed_by: string | null;
  comment: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
};

function mapChangedBy(
  profileId: string | null,
  profileMap: Map<string, ProfileRow>
): OrderStatusHistoryChangedBy | null {
  if (!profileId) return null;
  const profile = profileMap.get(profileId);
  if (!profile) {
    return {
      id: profileId,
      email: "—",
      fullName: null,
      role: null,
    };
  }

  return {
    id: profile.id,
    email: profile.email?.trim() || "—",
    fullName: profile.full_name?.trim() || null,
    role: profile.role?.trim() || null,
  };
}

function detectNoteKind(comment: string | null): "note" | "request" {
  const text = comment?.trim().toLowerCase() ?? "";
  if (text.startsWith("[reschedule request]")) {
    return "request";
  }
  return "note";
}

export function mapOrderStatusHistoryRow(
  row: SupabaseOrderStatusHistoryRow,
  profileMap: Map<string, ProfileRow>
): OrderStatusHistoryItem {
  const oldStatus = normalizeOrderStatus(row.old_status);
  const newStatus = normalizeOrderStatus(row.new_status);
  const isNote = oldStatus === newStatus;
  const comment = row.comment?.trim() || null;

  return {
    id: String(row.id),
    oldStatus,
    newStatus,
    oldStatusLabel: getOrderStatusLabel(oldStatus),
    newStatusLabel: getOrderStatusLabel(newStatus),
    isNote,
    noteKind: isNote ? detectNoteKind(comment) : "note",
    changedBy: mapChangedBy(row.changed_by, profileMap),
    comment,
    createdAt: row.created_at,
  };
}

export function mapOrderStatusHistoryRows(
  rows: SupabaseOrderStatusHistoryRow[],
  profileMap: Map<string, ProfileRow>
): OrderStatusHistoryItem[] {
  return rows.map((row) => mapOrderStatusHistoryRow(row, profileMap));
}
