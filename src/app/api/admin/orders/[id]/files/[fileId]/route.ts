import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { deleteAdminOrderFile } from "@/server/mutations/orders/deleteAdminOrderFile";

type RouteContext = {
  params: Promise<{ id: string; fileId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id, fileId } = await context.params;

  const { deletedId, error, notFound, fileNotFound } = await deleteAdminOrderFile(
    auth.supabase,
    id,
    fileId
  );

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (fileNotFound) {
    return NextResponse.json(
      { data: null, error: "File not found" },
      { status: 404 }
    );
  }

  if (error) {
    const isConfig = error.includes("SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      { data: null, error },
      { status: isConfig ? 503 : 500 }
    );
  }

  return NextResponse.json(
    { data: { id: deletedId }, error: null },
    { status: 200 }
  );
}
