import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { formatOrderDisplayId } from "@/features/orders/lib/format-order-display-id";
import { getOrderStatusLabel } from "@/lib/constants/order-status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const clientId = id?.trim();
  if (!clientId) {
    return NextResponse.json({ data: null, error: "Client id is required" }, { status: 400 });
  }

  const requestUrl = new URL(_request.url);
  const pageRaw = Number(requestUrl.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const pageSize = 30;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createSupabaseServerClient();
  const { data, error, count } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, scheduled_date, scheduled_time, service_type, estimated_price, final_price, currency, assigned_cleaner:profiles!orders_assigned_cleaner_id_fkey(full_name, email)",
      { count: "exact" }
    )
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: false, nullsFirst: false })
    .order("scheduled_time", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((row) => {
    const id = String((row as { id: string }).id);
    const statusRaw = String((row as { status: string | null }).status ?? "new");
    const amount =
      typeof (row as { final_price?: number | null }).final_price === "number"
        ? ((row as { final_price?: number | null }).final_price as number)
        : Number((row as { estimated_price?: number | null }).estimated_price ?? 0);

    return {
      id,
      displayId: formatOrderDisplayId(id, (row as { order_number?: string | null }).order_number ?? null),
      status: statusRaw,
      statusLabel: getOrderStatusLabel(statusRaw),
      paymentStatus: String((row as { payment_status?: string | null }).payment_status ?? "unpaid"),
      scheduledDate: ((row as { scheduled_date?: string | null }).scheduled_date ?? "")?.slice(0, 10) || null,
      scheduledTime: (row as { scheduled_time?: string | null }).scheduled_time ?? null,
      serviceType: (row as { service_type?: string | null }).service_type ?? null,
      total: amount,
      currency: String((row as { currency?: string | null }).currency ?? "EUR"),
      cleanerName: (() => {
        const cleanerRaw = (row as {
          assigned_cleaner?:
            | { full_name: string | null; email: string | null }
            | { full_name: string | null; email: string | null }[]
            | null;
        }).assigned_cleaner;
        const cleaner = Array.isArray(cleanerRaw) ? cleanerRaw[0] : cleanerRaw;
        return cleaner?.full_name?.trim() || cleaner?.email?.trim() || null;
      })(),
    };
  });

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasMore = page < totalPages;

  return NextResponse.json(
    {
      data: {
        items: rows,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasMore,
        },
      },
      error: null,
    },
    { status: 200 }
  );
}
