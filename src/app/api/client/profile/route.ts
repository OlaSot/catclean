import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import type { PortalClientProfile } from "@/features/client-portal/types/portal.types";

export async function GET() {
  const auth = await requireClientApiAuth();
  if (!auth.ok) return auth.response;

  const { data: profile, error } = await auth.supabase
    .from("profiles")
    .select("full_name, email, phone, avatar_url")
    .eq("id", auth.userId)
    .maybeSingle();

  if (error) {
    console.error("GET /api/client/profile:", error);
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ data: null, error: "Profile not found" }, { status: 404 });
  }

  const fullName = profile.full_name?.trim() || profile.email?.trim() || "Client";
  const firstName = fullName.split(/\s+/)[0] ?? fullName;

  const data: PortalClientProfile = {
    firstName,
    fullName,
    email: profile.email?.trim() || "—",
    phone: profile.phone?.trim() || "—",
    avatarUrl: profile.avatar_url?.trim() || null,
    // TODO: load from profile.preferred_language when column exists
    language: "English",
    // TODO: load from notification_preferences when endpoint/table exists
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
  };

  return NextResponse.json({ data, error: null }, { status: 200 });
}
