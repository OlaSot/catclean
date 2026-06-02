import type { AdminComplaintListItem } from "@/entities/complaint/admin-complaint.types";
import {
  getComplaintReasonLabel,
  isComplaintStatus,
  type ComplaintStatus,
} from "@/lib/constants/complaint";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import type { SupabaseClient } from "@supabase/supabase-js";

function statusLabel(status: ComplaintStatus): string {
  const labels: Record<ComplaintStatus, string> = {
    open: "Open",
    in_progress: "In progress",
    resolved: "Resolved",
    closed: "Closed",
  };
  return labels[status] ?? status;
}

export async function updateAdminComplaint(
  supabase: SupabaseClient,
  complaintId: string,
  patch: {
    status?: string;
    adminNote?: string | null;
  }
): Promise<{
  complaint: AdminComplaintListItem | null;
  error: string | null;
  notFound?: boolean;
}> {
  const id = complaintId.trim();
  if (!id) {
    return { complaint: null, error: "Invalid complaint id" };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.status !== undefined) {
    if (!isComplaintStatus(patch.status)) {
      return { complaint: null, error: "Invalid complaint status" };
    }
    updates.status = patch.status;
  }

  if (patch.adminNote !== undefined) {
    updates.admin_note =
      typeof patch.adminNote === "string" && patch.adminNote.trim()
        ? patch.adminNote.trim()
        : null;
  }

  if (Object.keys(updates).length <= 1) {
    return { complaint: null, error: "No fields to update" };
  }

  const { data: row, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", id)
    .select(
      "id, order_id, client_id, status, reason, description, admin_note, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    console.error("updateAdminComplaint:", error);
    return { complaint: null, error: error.message };
  }

  if (!row) {
    return { complaint: null, error: null, notFound: true };
  }

  const { data: client } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", row.client_id)
    .maybeSingle();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("id", row.order_id)
    .maybeSingle();

  const status = row.status as ComplaintStatus;

  return {
    complaint: {
      id: row.id,
      orderId: row.order_id,
      orderDisplayId: formatOrderDisplayId(
        row.order_id,
        (order as { order_number?: string | null } | null)?.order_number
      ),
      clientId: row.client_id,
      clientName:
        (client as { full_name?: string | null } | null)?.full_name?.trim() ||
        "—",
      clientEmail:
        (client as { email?: string | null } | null)?.email?.trim() || "—",
      status,
      statusLabel: statusLabel(status),
      reason: row.reason,
      reasonLabel: getComplaintReasonLabel(row.reason),
      description: row.description,
      adminNote: row.admin_note?.trim() || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    error: null,
  };
}
