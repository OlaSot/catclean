import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const notificationId = id?.trim();

  if (!notificationId) {
    return NextResponse.json(
      { data: null, error: "Notification id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("PATCH /api/notifications/[id]/read:", error);
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  if (!data?.id) {
    return NextResponse.json(
      { data: null, error: "Notification not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: { id: data.id }, error: null }, { status: 200 });
}

