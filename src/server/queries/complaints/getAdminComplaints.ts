import type { AdminComplaintListItem } from "@/entities/complaint/admin-complaint.types";
import {
  getComplaintReasonLabel,
  type ComplaintStatus,
} from "@/lib/constants/complaint";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

type ComplaintRow = {
  id: string;
  order_id: string;
  client_id: string;
  status: string;
  reason: string;
  description: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type OrderRow = {
  id: string;
  order_number: string | null;
};

function statusLabel(status: ComplaintStatus): string {
  const labels: Record<ComplaintStatus, string> = {
    open: "Open",
    in_progress: "In progress",
    resolved: "Resolved",
    closed: "Closed",
  };
  return labels[status] ?? status;
}

export async function getAdminComplaints(): Promise<{
  complaints: AdminComplaintListItem[];
  error: string | null;
}> {
  const supabase = await createSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("complaints")
    .select(
      "id, order_id, client_id, status, reason, description, admin_note, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminComplaints:", error);
    return { complaints: [], error: error.message };
  }

  const complaintRows = (rows ?? []) as ComplaintRow[];
  const profileIds = [
    ...new Set(complaintRows.map((r) => r.client_id).filter(Boolean)),
  ];
  const orderIds = [...new Set(complaintRows.map((r) => r.order_id))];

  const profileMap = new Map<string, ProfileRow>();
  const orderMap = new Map<string, OrderRow>();

  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", profileIds);

    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, profile as ProfileRow);
    }
  }

  if (orderIds.length > 0) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number")
      .in("id", orderIds);

    for (const order of orders ?? []) {
      orderMap.set(order.id, order as OrderRow);
    }
  }

  const complaints: AdminComplaintListItem[] = complaintRows.map((row) => {
    const client = profileMap.get(row.client_id);
    const order = orderMap.get(row.order_id);
    const status = row.status as ComplaintStatus;

    return {
      id: row.id,
      orderId: row.order_id,
      orderDisplayId: formatOrderDisplayId(row.order_id, order?.order_number),
      clientId: row.client_id,
      clientName: client?.full_name?.trim() || "—",
      clientEmail: client?.email?.trim() || "—",
      status,
      statusLabel: statusLabel(status),
      reason: row.reason,
      reasonLabel: getComplaintReasonLabel(row.reason),
      description: row.description,
      adminNote: row.admin_note?.trim() || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  return { complaints, error: null };
}
