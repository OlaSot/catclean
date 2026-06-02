import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";

type RouteContext = {
  params: Promise<{ id: string; preferredId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) return auth.response;

  const { id, preferredId } = await context.params;
  const clientId = id?.trim();
  const targetId = preferredId?.trim();
  if (!clientId || !targetId) {
    return NextResponse.json(
      { data: null, error: "Client id and preferred cleaner id are required" },
      { status: 400 }
    );
  }

  const { error } = await auth.supabase
    .from("client_preferred_cleaners")
    .delete()
    .eq("id", targetId)
    .eq("client_id", clientId);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { ok: true }, error: null }, { status: 200 });
}
