import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { getClientPreferredCleaners } from "@/lib/dispatch/get-client-preferred-cleaners";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const clientId = id?.trim();
  if (!clientId) {
    return NextResponse.json({ data: null, error: "Client id is required" }, { status: 400 });
  }

  const { items, error } = await getClientPreferredCleaners(auth.supabase, clientId);
  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  const cleanerIds = items.map((item) => item.cleanerId);
  let cleanerMap = new Map<string, { full_name: string | null; email: string | null }>();
  if (cleanerIds.length > 0) {
    const { data: cleanerRows } = await auth.supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", cleanerIds);
    cleanerMap = new Map(
      (cleanerRows ?? []).map((row) => [
        row.id,
        { full_name: row.full_name, email: row.email },
      ])
    );
  }

  return NextResponse.json(
    {
      data: items.map((item) => {
        const cleaner = cleanerMap.get(item.cleanerId);
        return {
          id: item.id,
          clientId: item.clientId,
          cleanerId: item.cleanerId,
          isPrimary: item.isPrimary,
          createdAt: item.createdAt,
          cleanerName:
            cleaner?.full_name?.trim() || cleaner?.email?.trim() || "Cleaner",
        };
      }),
      error: null,
    },
    { status: 200 }
  );
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const clientId = id?.trim();
  if (!clientId) {
    return NextResponse.json({ data: null, error: "Client id is required" }, { status: 400 });
  }

  let body: { cleanerId?: string; isPrimary?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON body" }, { status: 400 });
  }

  const cleanerId = body.cleanerId?.trim() ?? "";
  if (!cleanerId) {
    return NextResponse.json({ data: null, error: "cleanerId is required" }, { status: 400 });
  }
  const isPrimary = body.isPrimary !== false;

  if (isPrimary) {
    await auth.supabase
      .from("client_preferred_cleaners")
      .update({ is_primary: false })
      .eq("client_id", clientId);
  }

  const { error } = await auth.supabase
    .from("client_preferred_cleaners")
    .upsert(
      {
        client_id: clientId,
        cleaner_id: cleanerId,
        is_primary: isPrimary,
      },
      { onConflict: "client_id,cleaner_id" }
    );

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return GET(request, context);
}
