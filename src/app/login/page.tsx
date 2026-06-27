import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { LoginPageClient } from "./LoginPageClient";

export default function LoginPage() {
  const { url, anonKey } = getSupabasePublicEnv();

  return <LoginPageClient supabaseUrl={url} supabaseAnonKey={anonKey} />;
}
