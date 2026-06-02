import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminClientById } from "@/server/queries/clients/getAdminClients";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const profileId = id?.trim();

  if (!profileId) {
    return NextResponse.json(
      { data: null, error: "Client id is required" },
      { status: 400 }
    );
  }

  const { client, error } = await getAdminClientById(profileId);

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  if (!client) {
    return NextResponse.json(
      { data: null, error: "Client not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: client, error: null }, { status: 200 });
}
