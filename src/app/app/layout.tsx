import type { ReactNode } from "react";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import ClientAppLayout from "./ClientAppLayout";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { url, anonKey } = getSupabasePublicEnv();

  return (
    <ClientAppLayout supabaseUrl={url} supabaseAnonKey={anonKey}>
      {children}
    </ClientAppLayout>
  );
}
