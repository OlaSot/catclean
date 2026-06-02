import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser singleton for client components. Uses cookie-based session (SSR-compatible).
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
