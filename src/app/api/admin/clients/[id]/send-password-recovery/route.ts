import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const profileId = id?.trim();

  if (!profileId) {
    return NextResponse.json(
      { data: null, error: "Client id is required" },
      { status: 400 }
    );
  }

  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { data: null, error: profileError.message },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json(
      { data: null, error: "Client not found" },
      { status: 404 }
    );
  }

  if ((profile.role ?? "").toLowerCase() !== "client") {
    return NextResponse.json(
      { data: null, error: "Profile is not a client" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return NextResponse.json(
      {
        data: null,
        error:
          admin.error ??
          "Cannot create new client automatically: service role key is not configured.",
      },
      { status: 503 }
    );
  }

  const email = (profile.email ?? "").trim();
  if (!email) {
    return NextResponse.json(
      { data: null, error: "Client email is missing" },
      { status: 400 }
    );
  }

  // In current supabase-js typing, resetPasswordForEmail lives under auth (not auth.admin).
  const { error: resetError } = await admin.supabase.auth.resetPasswordForEmail(
    email
  );

  if (resetError) {
    return NextResponse.json(
      { data: null, error: resetError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { data: { success: true }, error: null },
    { status: 200 }
  );
}

