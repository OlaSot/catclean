import { NextResponse } from "next/server";
import { isStaffApiRole } from "@/lib/permissions/staff-api";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";

type StaffAuthSuccess = {
  ok: true;
  supabase: SupabaseClient;
  userId: string;
};

type StaffAuthFailure = {
  ok: false;
  response: NextResponse;
};

export type StaffApiAuthResult = StaffAuthSuccess | StaffAuthFailure;

export async function requireStaffApiAuth(): Promise<StaffApiAuthResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !isStaffApiRole(profile?.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { data: null, error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, supabase, userId: user.id };
}
