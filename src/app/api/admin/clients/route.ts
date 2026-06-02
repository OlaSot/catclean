import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import type { CreateAdminClientRequestBody } from "@/features/clients/types/create-admin-client-api.types";
import { createAdminClient } from "@/server/mutations/clients/createAdminClient";
import { getAdminClients } from "@/server/queries/clients/getAdminClients";
import { parseAdminClientsQuery } from "@/server/queries/clients/parse-admin-clients-query";

export async function GET(request: Request) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const queryFilters = parseAdminClientsQuery(searchParams);

  const { clients, error } = await getAdminClients(queryFilters);

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data: clients, error: null }, { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  let body: CreateAdminClientRequestBody;
  try {
    body = (await request.json()) as CreateAdminClientRequestBody;
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
  const clientType = body.clientType;
  const companyName =
    typeof body.companyName === "string" ? body.companyName.trim() : null;

  if (!email || !password || !fullName || !phone) {
    return NextResponse.json(
      { data: null, error: "email, password, fullName and phone are required" },
      { status: 400 }
    );
  }

  if (clientType !== "private" && clientType !== "business") {
    return NextResponse.json(
      { data: null, error: "clientType must be private or business" },
      { status: 400 }
    );
  }

  const { client, error } = await createAdminClient({
    email,
    password,
    fullName,
    phone,
    clientType,
    companyName: companyName || null,
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

  if (!client) {
    return NextResponse.json(
      { data: null, error: "Client was not created" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: client, error: null }, { status: 201 });
}
