"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { I18nProvider } from "@/i18n/I18nProvider";
import { devLog } from "@/lib/dev-log";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";

type Props = {
  children: ReactNode;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
};

export default function ClientAppLayout({
  children,
  supabaseUrl,
  supabaseAnonKey,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
  const supabase = useMemo(
    () =>
      supabaseConfigured
        ? createSupabaseBrowserClient({ url: supabaseUrl!, anonKey: supabaseAnonKey! })
        : null,
    [supabaseAnonKey, supabaseConfigured, supabaseUrl],
  );

  useEffect(() => {
    if (!supabase) {
      router.replace("/login?error=config");
      return;
    }

    const run = async () => {
      const { data: userRes, error: userError } = await supabase.auth.getUser();
      const user = userRes.user;

      devLog("[app/layout] getUser", {
        path: pathname,
        userId: user?.id ?? null,
        error: userError?.message ?? null,
      });

      if (!user) {
        devLog("[app/layout] redirect", {
          target: "/login",
          reason: "no user",
          path: pathname,
        });
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      devLog("[app/layout] profile", {
        path: pathname,
        userId: user.id,
        role: profile?.role ?? null,
        error: error?.message ?? null,
      });

      if (error || !profile?.role) {
        devLog("[app/layout] redirect", {
          target: "/login",
          reason: error ? "profile error" : "no role",
          path: pathname,
        });
        router.replace("/login");
        return;
      }

      const role = profile.role as "admin" | "operator" | "cleaner" | "client";

      const isAdminPath = pathname.startsWith("/app/admin");
      const isCleanerPath = pathname.startsWith("/app/cleaner");
      const isClientPath = pathname.startsWith("/app/client");

      const allow =
        ((role === "admin" || role === "operator") && isAdminPath) ||
        (role === "cleaner" && isCleanerPath) ||
        (role === "client" && isClientPath) ||
        pathname === "/app";

      if (!allow) {
        devLog("[app/layout] redirect", {
          target: "/app",
          reason: "route guard",
          role,
          path: pathname,
        });
        router.replace("/app");
      }
    };

    run();
  }, [pathname, router, supabase]);

  return <I18nProvider>{children}</I18nProvider>;
}
