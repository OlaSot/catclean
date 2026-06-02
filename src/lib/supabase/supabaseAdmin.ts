import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const MISSING_SERVICE_ROLE_MESSAGE =
  "SUPABASE_SERVICE_ROLE_KEY is not configured on the server. Add it to .env.local to create users from the admin panel.";

export type SupabaseAdminClientResult =
  | { supabase: SupabaseClient; error: null }
  | { supabase: null; error: string };

export function createSupabaseAdminClient(): SupabaseAdminClientResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url?.trim()) {
    return {
      supabase: null,
      error: "NEXT_PUBLIC_SUPABASE_URL is not configured on the server.",
    };
  }

  if (!serviceRoleKey?.trim()) {
    return { supabase: null, error: MISSING_SERVICE_ROLE_MESSAGE };
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { supabase, error: null };
}
