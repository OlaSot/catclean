import { NextResponse } from "next/server";
import { createAdminOrder } from "@/server/mutations/orders/createAdminOrder";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

type PublicBookingBody = {
  serviceType: "regular_cleaning" | "move_in_out";
  serviceDetails: Record<string, unknown>;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
  street: string;
  houseNumber: string;
  apartment?: string;
  zip?: string;
  floor?: string;
  city: string;
  estimatedPrice: number;
  customerComment?: string;
  homeResetUpgrade?: string;
  bookingProduct?: string;
};

function buildFallbackEmail(input: PublicBookingBody): string {
  const digits = input.clientPhone.replace(/\D/g, "");
  const suffix = Date.now().toString(36);
  return `booking-${digits || "client"}-${suffix}@catclean.local`;
}

export async function POST(request: Request) {
  let body: PublicBookingBody;
  try {
    body = (await request.json()) as PublicBookingBody;
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON body" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = body.clientEmail?.trim() ? body.clientEmail.trim() : buildFallbackEmail(body);

  const { order, error, fieldErrors } = await createAdminOrder(supabase, user?.id ?? null, {
    clientEmail: email,
    clientName: body.clientName,
    clientPhone: body.clientPhone,
    serviceType: body.serviceType,
    scheduledDate: body.scheduledDate,
    scheduledTime: body.scheduledTime,
    street: body.street,
    city: body.city,
    houseNumber: body.houseNumber,
    apartment: body.apartment,
    zip: body.zip,
    floor: body.floor,
    estimatedPrice: body.estimatedPrice,
    serviceDetails: body.serviceDetails,
    customerComment: body.customerComment,
    homeResetUpgrade: body.homeResetUpgrade,
    bookingProduct: body.bookingProduct,
  });

  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { data: null, error: error ?? "Validation error", fieldErrors },
      { status: 400 }
    );
  }

  if (error || !order) {
    return NextResponse.json({ data: null, error: error ?? "Failed to create booking" }, { status: 400 });
  }

  return NextResponse.json(
    {
      data: {
        orderId: order.displayId,
        status: order.status,
        confirmationPending: order.status === "awaiting_confirmation",
      },
      error: null,
    },
    { status: 201 }
  );
}
