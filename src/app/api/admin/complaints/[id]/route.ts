import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import type { AdminUpdateComplaintRequestBody } from "@/features/complaints/types/admin-complaints-api.types";
import { updateAdminComplaint } from "@/server/mutations/complaints/updateAdminComplaint";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  let body: AdminUpdateComplaintRequestBody = {};
  try {
    body = (await request.json()) as AdminUpdateComplaintRequestBody;
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { complaint, error, notFound } = await updateAdminComplaint(
    auth.supabase,
    id,
    {
      status: body.status,
      adminNote: body.adminNote,
    }
  );

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Complaint not found" },
      { status: 404 }
    );
  }

  if (error || !complaint) {
    return NextResponse.json(
      { data: null, error: error ?? "Failed to update complaint" },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: complaint, error: null }, { status: 200 });
}
