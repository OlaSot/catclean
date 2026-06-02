import { devLog } from "@/lib/dev-log";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

export default async function AppIndex() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  devLog("[app/page] getUser", {
    path: "/app",
    userId: user?.id ?? null,
    error: userErr?.message ?? null,
  });

  if (!user) {
    devLog("[app/page] redirect", { target: "/login", reason: "no user" });
    redirect("/login");
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  devLog("[app/page] profile", {
    path: "/app",
    userId: user.id,
    role: profile?.role ?? null,
    error: profileErr?.message ?? null,
  });

  if (profileErr || !profile?.role) {
    devLog("[app/page] redirect", {
      target: "/login",
      reason: profileErr ? "profile error" : "no role",
    });
    redirect("/login");
  }

  const role = profile.role;
  const target =
    role === "admin" || role === "operator"
      ? "/app/admin"
      : role === "cleaner"
        ? "/app/cleaner"
        : "/app/client";

  devLog("[app/page] redirect", { target, role, path: "/app" });
  redirect(target);
}
