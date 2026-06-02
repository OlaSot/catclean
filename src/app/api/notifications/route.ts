import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { isStaffApiRole } from "@/lib/permissions/staff-api";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile as { role?: string | null } | null)?.role ?? null;
  const isStaff = isStaffApiRole(role);

  const { searchParams } = new URL(request.url);
  const unread = searchParams.get("unread") === "true";

  let query = supabase
    .from("notifications")
    .select("id, user_id, role_target, type, title, message, order_id, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  // For MVP return only current user's notifications (even for staff).
  // Staff can still see all via RLS if needed, but UI targets current user.
  query = query.eq("user_id", user.id);

  if (unread) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("GET /api/notifications:", error);
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data: (data ?? []).map((row) => ({
        id: (row as any).id as string,
        userId: (row as any).user_id as string,
        roleTarget: (row as any).role_target as string,
        type: (row as any).type as string,
        title: (row as any).title as string,
        message: ((row as any).message as string | null) ?? null,
        orderId: ((row as any).order_id as string | null) ?? null,
        isRead: Boolean((row as any).is_read),
        createdAt: (row as any).created_at as string,
      })),
      error: null,
      meta: { isStaff },
    },
    { status: 200 }
  );
}

