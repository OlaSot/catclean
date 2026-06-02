import { NextResponse } from "next/server";
import { requireCleanerApiAuth } from "@/lib/api/cleaner-api-auth";
import { deleteCleanerOrderFile } from "@/server/mutations/orders/deleteCleanerOrderFile";

type RouteContext = {
  params: Promise<{ id: string; fileId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireCleanerApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id, fileId } = await context.params;

  const { deletedId, error, notFound, forbidden, fileNotFound } =
    await deleteCleanerOrderFile(auth.supabase, id, auth.userId, fileId);

  if (forbidden) {
    return NextResponse.json(
      { data: null, error: error ?? "Forbidden" },
      { status: 403 }
    );
  }

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
