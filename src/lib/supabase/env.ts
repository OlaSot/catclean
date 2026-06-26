export function getSupabasePublicEnv():
  | { url: string; anonKey: string }
  | { url: null; anonKey: null } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    null;

  if (!url || !anonKey) {
    return { url: null, anonKey: null };
  }

  return { url, anonKey };
}

export function isSupabasePublicEnvConfigured(): boolean {
  const env = getSupabasePublicEnv();
  return Boolean(env.url && env.anonKey);
}
