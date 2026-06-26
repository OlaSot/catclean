import { NextResponse } from "next/server";
import { requireClientApiAuth } from "@/lib/api/client-api-auth";
import { getClientSavedAddresses } from "@/server/queries/addresses/getClientSavedAddresses";

export async function GET() {
  const auth = await requireClientApiAuth();
  if (!auth.ok) return auth.response;

  const { addresses, error } = await getClientSavedAddresses(auth.userId);

  if (error) {
    console.error("GET /api/client/addresses:", error);
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data: addresses, error: null }, { status: 200 });
}
