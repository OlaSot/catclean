import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { getAdminOrderFiles } from "@/server/queries/orders/getAdminOrderFiles";
import { uploadAdminOrderFile } from "@/server/mutations/orders/uploadAdminOrderFile";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const { files, error, notFound } = await getAdminOrderFiles(auth.supabase, id);

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 });
  }

  return NextResponse.json({ data: files, error: null }, { status: 200 });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireStaffApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { data: null, error: "file is required" },
      { status: 400 }
    );
  }

  const category =
    typeof formData.get("category") === "string"
      ? String(formData.get("category"))
      : "";

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const fileName = file.name || "file";

  const { file: created, error, notFound } = await uploadAdminOrderFile(
    auth.supabase,
    id,
    auth.userId,
    bytes,
    mimeType,
    fileName,
    category
  );

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
      { status: 404 }
    );
  }

  if (error) {
    const isClient =
      error.includes("Only JPEG") ||
      error.includes("10MB") ||
      error.includes("empty") ||
      error.includes("Invalid file category");
    const isConfig = error.includes("SUPABASE_SERVICE_ROLE_KEY");

    return NextResponse.json(
      { data: null, error },
      { status: isConfig ? 503 : isClient ? 400 : 500 }
    );
  }

  if (!created) {
    return NextResponse.json(
      { data: null, error: "File was not uploaded" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: created, error: null }, { status: 201 });
}
