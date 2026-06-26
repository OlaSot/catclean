import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";

export const dynamic = "force-dynamic";
import { devLog } from "@/lib/dev-log";
import { isStaffApiRole } from "@/lib/permissions/staff-api";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  devLog("[admin/layout] getUser", {
    path: "/app/admin",
    userId: user?.id ?? null,
    error: userError?.message ?? null,
  });

  if (userError || !user) {
    devLog("[admin/layout] redirect", {
      target: "/login",
      reason: userError ? "getUser error" : "no user",
    });
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email, full_name")
    .eq("id", user.id)
    .single();

  devLog("[admin/layout] profile", {
    path: "/app/admin",
    userId: user.id,
    role: profile?.role ?? null,
    error: profileError?.message ?? null,
  });

  if (profileError || !isStaffApiRole(profile?.role)) {
    devLog("[admin/layout] redirect", {
      target: "/app",
      reason: profileError ? "profile error" : "not staff",
      role: profile?.role ?? null,
    });
    redirect("/app");
  }

  const userEmail =
    profile.email?.trim() || user.email?.trim() || "Admin user";
  const userRole = profile.role ?? "admin";

  return (
    <AdminShell userEmail={userEmail} userRole={userRole}>
      {children}
    </AdminShell>
  );
}
