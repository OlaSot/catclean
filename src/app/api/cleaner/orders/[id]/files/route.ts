import { NextResponse } from "next/server";
import { requireCleanerApiAuth } from "@/lib/api/cleaner-api-auth";
import { uploadCleanerOrderFile } from "@/server/mutations/orders/uploadCleanerOrderFile";
import { getCleanerOrderFiles } from "@/server/queries/orders/getCleanerOrderFiles";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireCleanerApiAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const { files, error, notFound, forbidden } = await getCleanerOrderFiles(
    auth.supabase,
    id,
    auth.userId
  );

  if (forbidden) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  if (notFound) {
    return NextResponse.json(
      { data: null, error: "Order not found" },
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

  return NextResponse.json({ data: files, error: null }, { status: 200 });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireCleanerApiAuth();
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

  const { file: created, error, notFound, forbidden } = await uploadCleanerOrderFile(
    auth.supabase,
    id,
    auth.userId,
    bytes,
    mimeType,
    fileName,
    category
  );

  if (forbidden) {
    return NextResponse.json(
      { data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

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
