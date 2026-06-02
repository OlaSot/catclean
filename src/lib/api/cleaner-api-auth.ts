import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";

type CleanerAuthSuccess = {
  ok: true;
  supabase: SupabaseClient;
  userId: string;
};

type CleanerAuthFailure = {
  ok: false;
  response: NextResponse;
};

export type CleanerApiAuthResult = CleanerAuthSuccess | CleanerAuthFailure;

export async function requireCleanerApiAuth(): Promise<CleanerApiAuthResult> {
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

  if (profileError || profile?.role !== "cleaner") {
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
