import { NextResponse } from "next/server";
import { requireStaffApiAuth } from "@/lib/api/staff-api-auth";
import { uploadCleanerAvatar } from "@/server/mutations/cleaners/uploadCleanerAvatar";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  const { cleaner, error } = await uploadCleanerAvatar(id, bytes, mimeType);

  if (error) {
    const isClient =
      error.includes("Only JPEG") ||
      error.includes("2MB") ||
      error.includes("empty") ||
      error === "Cleaner not found" ||
      error === "Profile is not a cleaner" ||
      error === "Invalid cleaner id";
    const isConfig = error.includes("SUPABASE_SERVICE_ROLE_KEY");

    return NextResponse.json(
      { data: null, error },
      { status: isConfig ? 503 : isClient ? 400 : 500 }
    );
  }

  if (!cleaner) {
    return NextResponse.json(
      { data: null, error: "Cleaner was not updated" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: cleaner, error: null }, { status: 200 });
}
