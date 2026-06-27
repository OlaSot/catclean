import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export type SupabaseBrowserConfig = {
  url: string;
  anonKey: string;
};

export function createSupabaseBrowserClient(config?: SupabaseBrowserConfig) {
  const fromEnv = getSupabasePublicEnv();
  const url = config?.url ?? fromEnv.url;
  const anonKey = config?.anonKey ?? fromEnv.anonKey;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(url, anonKey);
}
