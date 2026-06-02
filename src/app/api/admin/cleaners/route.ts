import { devLog } from "@/lib/dev-log";
import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import type { CreateAdminCleanerRequestBody } from "@/features/cleaners/types/create-admin-cleaner-api.types";
import { createAdminCleaner } from "@/server/mutations/cleaners/createAdminCleaner";
import { enrichCleanerAvatarUrls } from "@/server/queries/cleaners/enrichCleanerAvatarUrls";
import { getAdminCleaners } from "@/server/queries/cleaners/getAdminCleaners";
import { parseAdminCleanersQuery } from "@/server/queries/cleaners/parse-admin-cleaners-query";

function parseBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === 1;
}

export async function GET(request: Request) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const queryFilters = parseAdminCleanersQuery(searchParams);

  const { cleaners, error } = await getAdminCleaners(queryFilters);

  devLog("[api/admin/cleaners] returned cleaner ids", {
    count: cleaners.length,
    cleaners: cleaners.map((c) => ({
      id: c.id,
      cleanerProfileId: c.cleanerProfileId,
    })),
    error,
  });

  if (error) {
    return NextResponse.json(
      { data: null, error },
      { status: 500 }
    );
  }

  const cleanersWithAvatars = await enrichCleanerAvatarUrls(cleaners);

  return NextResponse.json(
    { data: cleanersWithAvatars, error: null },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  let body: CreateAdminCleanerRequestBody;
  try {
    body = (await request.json()) as CreateAdminCleanerRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const baseCity = typeof body.baseCity === "string" ? body.baseCity.trim() : "";
  const status = body.status;
  const workingRadiusKm = Number(body.workingRadiusKm);

  if (!email || !password || !fullName || !phone || !baseCity) {
    return NextResponse.json(
      {
        data: null,
        error: "email, password, fullName, phone and baseCity are required",
      },
      { status: 400 }
    );
  }

  if (status !== "active" && status !== "pending") {
    return NextResponse.json(
      { data: null, error: "status must be active or pending" },
      { status: 400 }
    );
  }

  const { cleaner, error } = await createAdminCleaner({
    email,
    password,
    fullName,
    phone,
    status,
    baseCity,
    workingRadiusKm,
    petFriendly: parseBoolean(body.petFriendly),
    ownsVacuum: parseBoolean(body.ownsVacuum),
    ownsSteamCleaner: parseBoolean(body.ownsSteamCleaner),
    acceptsWindows: parseBoolean(body.acceptsWindows),
    acceptsDryCleaning: parseBoolean(body.acceptsDryCleaning),
  });

  if (error) {
    const isConfig =
      error.includes("SUPABASE_SERVICE_ROLE_KEY") ||
      error.includes("NEXT_PUBLIC_SUPABASE_URL");
    return NextResponse.json(
      { data: null, error },
      { status: isConfig ? 503 : 400 }
    );
  }

  if (!cleaner) {
    return NextResponse.json(
      { data: null, error: "Cleaner was not created" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: cleaner, error: null }, { status: 201 });
}
