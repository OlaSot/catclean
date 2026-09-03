import { NextResponse } from "next/server";
import { createAdminOrder } from "@/server/mutations/orders/createAdminOrder";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import { createOrderConfirmationToken } from "@/server/mutations/orders/createOrderConfirmationToken";
import { isHannoverServiceArea } from "@/lib/booking/hannover-service-area";
import { isPublicBookingSlotTooSoon } from "@/lib/booking/berlin-datetime";
import { isBookingStartTime } from "@/lib/booking/booking-time-slots";
import { estimatePublicBookingDurationMinutes } from "@/lib/booking/public-booking-duration";
import { normalizeScheduleTime } from "@/lib/orders/schedule-time";
import { findRecentDuplicatePublicBooking } from "@/server/queries/orders/findRecentDuplicatePublicBooking";
import { getPublicBookingSlotAvailability } from "@/server/queries/bookings/getPublicBookingSlotAvailability";
import { rollbackPublicBookingOrder } from "@/server/mutations/orders/rollbackPublicBookingOrder";
import { sendBookingReceivedEmail } from "@/lib/email/send-booking-received-email";
import { sendNewBookingTelegramNotification } from "@/lib/telegram/send-new-booking-notification";
import { getBookingProductLabelEn } from "@/lib/orders/booking-product-label";
import {
  buildPublicConfirmationUrl,
  getPublicSiteUrl,
} from "@/lib/email/public-site-url";

type PublicBookingBody = {
  serviceType: "regular_cleaning" | "move_in_out";
  serviceDetails: Record<string, unknown>;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
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
  repeatFromOrderId?: string;
};

type CachedBooking = {
  orderId: string;
  status: string;
  confirmationPending: boolean;
  confirmationLinkReady: boolean;
  emailSent: boolean;
  expiresAt: number;
};

const IDEMPOTENCY_TTL_MS = 15 * 60 * 1000;
const idempotencyCache = new Map<string, CachedBooking>();

function readIdempotencyKey(request: Request): string | null {
  const raw = request.headers.get("Idempotency-Key")?.trim() ?? "";
  if (!raw || raw.length > 128) return null;
  if (!/^[\w.:-]+$/.test(raw)) return null;
  return raw;
}

function getCachedBooking(key: string): CachedBooking | null {
  const hit = idempotencyCache.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    idempotencyCache.delete(key);
    return null;
  }
  return hit;
}

function bookingResponse(
  orderId: string,
  status: string,
  confirmationLinkReady: boolean,
  emailSent = false,
  statusCode = 201
) {
  return NextResponse.json(
    {
      data: {
        orderId,
        status,
        confirmationPending: status === "awaiting_confirmation",
        confirmationLinkReady,
        emailSent,
      },
      error: null,
    },
    { status: statusCode }
  );
}

export async function POST(request: Request) {
  try {
    let body: PublicBookingBody;
    try {
      body = (await request.json()) as PublicBookingBody;
    } catch {
      return NextResponse.json({ data: null, error: "Invalid JSON body" }, { status: 400 });
    }

    const idempotencyKey = readIdempotencyKey(request);
    if (idempotencyKey) {
      const cached = getCachedBooking(idempotencyKey);
      if (cached) {
        return bookingResponse(
          cached.orderId,
          cached.status,
          cached.confirmationLinkReady,
          cached.emailSent
        );
      }
    }

    const zip = typeof body.zip === "string" ? body.zip.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const scheduledDate = typeof body.scheduledDate === "string" ? body.scheduledDate.trim() : "";
    const scheduledTime = typeof body.scheduledTime === "string" ? body.scheduledTime.trim() : "";
    const normalizedTime = scheduledTime ? normalizeScheduleTime(scheduledTime) : null;
    const email = typeof body.clientEmail === "string" ? body.clientEmail.trim().toLowerCase() : "";
    const serviceType = typeof body.serviceType === "string" ? body.serviceType : "";

    const fieldErrors: Record<string, string> = {};
    if (!zip) {
      fieldErrors.zip = "public.validation.required";
    } else if (!isHannoverServiceArea(zip, city)) {
      fieldErrors.zip = "public.validation.regionHannoverAddress";
      fieldErrors.street = "public.validation.regionHannoverAddress";
    }
    if (scheduledDate && normalizedTime && isPublicBookingSlotTooSoon(scheduledDate, normalizedTime)) {
      fieldErrors.scheduledTime = "public.validation.slotTooSoon";
    } else if (normalizedTime && !isBookingStartTime(normalizedTime)) {
      fieldErrors.scheduledTime = "public.validation.chooseTime";
    }

    if (Object.keys(fieldErrors).length > 0) {
      const error =
        fieldErrors.zip ?? fieldErrors.street ?? fieldErrors.scheduledTime ?? "public.validation.completeFields";
      return NextResponse.json({ data: null, error, fieldErrors }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createSupabaseAdminClient();
    if (!admin.supabase) {
      return NextResponse.json({ data: null, error: admin.error }, { status: 500 });
    }

    let isRepeatBooking = false;
    const repeatFromOrderId =
      typeof body.repeatFromOrderId === "string" ? body.repeatFromOrderId.trim() : "";
    if (user?.id && repeatFromOrderId) {
      const { data: sourceOrder } = await admin.supabase
        .from("orders")
        .select("id")
        .eq("id", repeatFromOrderId)
        .eq("client_id", user.id)
        .maybeSingle();
      isRepeatBooking = Boolean(sourceOrder?.id);
    }

    const durationMinutes =
      serviceType
        ? estimatePublicBookingDurationMinutes({
            serviceType,
            serviceDetails:
              body.serviceDetails && typeof body.serviceDetails === "object"
                ? body.serviceDetails
                : {},
            bookingProduct:
              typeof body.bookingProduct === "string" ? body.bookingProduct : null,
          })
        : 180;

    if (scheduledDate && normalizedTime && serviceType) {
      const slots = await getPublicBookingSlotAvailability(admin.supabase, {
        date: scheduledDate,
        durationMinutes,
      });
      if (slots.error) {
        console.error("POST /api/public/bookings slot availability:", slots.error);
        return NextResponse.json(
          { data: null, error: "Failed to check availability" },
          { status: 500 }
        );
      }
      if (!slots.availableTimes.includes(normalizedTime)) {
        return NextResponse.json(
          {
            data: null,
            error: "public.validation.slotUnavailable",
            fieldErrors: { scheduledTime: "public.validation.slotUnavailable" },
          },
          { status: 400 }
        );
      }
    }

    if (email && scheduledDate && normalizedTime && serviceType) {
      const duplicate = await findRecentDuplicatePublicBooking(admin.supabase, {
        email,
        scheduledDate,
        scheduledTime: normalizedTime,
        serviceType,
      });
      if (duplicate.error) {
        console.error("POST /api/public/bookings duplicate lookup:", duplicate.error);
      } else if (duplicate.duplicate) {
        if (idempotencyKey) {
          idempotencyCache.set(idempotencyKey, {
            orderId: duplicate.duplicate.orderId,
            status: duplicate.duplicate.status,
            confirmationPending: duplicate.duplicate.status === "awaiting_confirmation",
            confirmationLinkReady: true,
            emailSent: false,
            expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
          });
        }
        return bookingResponse(duplicate.duplicate.orderId, duplicate.duplicate.status, true);
      }
    }

    const { order, orderId, clientId, error, fieldErrors: createFieldErrors } = await createAdminOrder(
      admin.supabase,
      user?.id ?? null,
      {
        clientEmail: body.clientEmail,
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
      }
    );

    if (createFieldErrors && Object.keys(createFieldErrors).length > 0) {
      return NextResponse.json(
        { data: null, error: error ?? "Validation error", fieldErrors: createFieldErrors },
        { status: 400 }
      );
    }

    if (error || !order) {
      console.error("POST /api/public/bookings:", error ?? "Failed to create booking");
      return NextResponse.json({ data: null, error: error ?? "Failed to create booking" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json(
        { data: null, error: "Order was created without an identifier" },
        { status: 500 }
      );
    }

    if (scheduledDate && normalizedTime) {
      const verify = await getPublicBookingSlotAvailability(admin.supabase, {
        date: scheduledDate,
        durationMinutes,
        extraDemand: 0,
      });
      if (verify.error) {
        console.error("POST /api/public/bookings slot recheck:", verify.error);
      } else if (!verify.availableTimes.includes(normalizedTime)) {
        const rollback = await rollbackPublicBookingOrder(admin.supabase, orderId);
        if (rollback.error) {
          console.error("POST /api/public/bookings rollback:", rollback.error);
        }
        return NextResponse.json(
          {
            data: null,
            error: "public.validation.slotUnavailable",
            fieldErrors: { scheduledTime: "public.validation.slotUnavailable" },
          },
          { status: 409 }
        );
      }
    }

    const confirmation = await createOrderConfirmationToken(
      admin.supabase,
      orderId,
      clientId ?? user?.id ?? null
    );

    if (confirmation.error) {
      console.error("POST /api/public/bookings confirmation token:", confirmation.error);
    }

    const confirmationUrl =
      confirmation.token
        ? buildPublicConfirmationUrl(getPublicSiteUrl(request), confirmation.token)
        : null;

    let emailSent = false;
    if (email && scheduledDate && normalizedTime) {
      try {
        const mail = await sendBookingReceivedEmail({
          to: email,
          clientName: typeof body.clientName === "string" ? body.clientName : "",
          orderNumber: order.displayId,
          scheduledDate,
          scheduledTime: normalizedTime,
          street: typeof body.street === "string" ? body.street : "",
          houseNumber: typeof body.houseNumber === "string" ? body.houseNumber : "",
          zip,
          city,
          serviceType,
          bookingProduct:
            typeof body.bookingProduct === "string" ? body.bookingProduct : null,
          confirmationUrl,
          estimatedPrice: order.service.estimatedPrice,
          currency: order.service.currency,
        });
        emailSent = mail.sent;
      } catch (mailError) {
        console.error("POST /api/public/bookings email:", mailError);
      }
    }

    await sendNewBookingTelegramNotification({
      orderNumber: order.displayId,
      service: order.service.productLabel || getBookingProductLabelEn(order.service.productKey, serviceType),
      scheduledDate,
      scheduledTime: normalizedTime ?? scheduledTime,
      zip,
      city,
      estimatedPrice: order.service.estimatedPrice,
      currency: order.service.currency,
      adminUrl: `${getPublicSiteUrl(request)}/app/admin/orders/${orderId}`,
      isRepeat: isRepeatBooking,
    });

    const payload = {
      orderId: order.displayId,
      status: order.status,
      confirmationPending: order.status === "awaiting_confirmation",
      confirmationLinkReady: !confirmation.error,
      emailSent,
      expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
    };
    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, payload);
    }

    return bookingResponse(
      payload.orderId,
      payload.status,
      payload.confirmationLinkReady,
      payload.emailSent
    );
  } catch (error) {
    console.error("POST /api/public/bookings unhandled:", error);
    const message = error instanceof Error ? error.message : "Unexpected booking error";
    return NextResponse.json(
      {
        data: null,
        error: process.env.NODE_ENV === "development" ? message : "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
