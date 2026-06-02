import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_ORDER_CURRENCY,
  DEFAULT_ORDER_STATUS,
  DEFAULT_PAYMENT_STATUS,
  ORDER_SERVICE_DETAIL_TABLE,
  ORDER_SERVICE_TYPES,
  type OrderServiceType,
} from "@/lib/constants/orders";
import { CLIENT_PROFILE_MISSING_MESSAGE } from "@/features/orders/types/create-order.types";
import { normalizeScheduleTime } from "@/lib/orders/schedule-time";
import {
  checkDuplicateProfilePhone,
  DUPLICATE_PHONE_MESSAGE,
  findProfileIdByNormalizedPhone,
  isPhoneNormalizedDuplicateError,
  validateProfilePhone,
  type ProfilePhoneFields,
} from "@/lib/phone/profile-phone";
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin";
import {
  tryCalculateOrderPrice,
  type OrderPriceBreakdown,
} from "@/lib/pricing/calculate-order-price";
import {
  getDetailTableForService,
  mapCreateServiceDetailsToDbRow,
} from "@/lib/pricing/map-create-service-details-to-db";
import { supportsAutoPricing } from "@/lib/pricing/pricing.constants";
import { upsertProfileForAuthUser } from "@/server/mutations/profiles/upsertProfileForAuthUser";
import { getAdminOrderById } from "@/server/queries/orders/getAdminOrderById";
import { randomBytes } from "crypto";

const SERVICE_TYPE_SET = new Set(
  ORDER_SERVICE_TYPES.map((item) => item.value)
);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalString(value: unknown): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s ? s : null;
}

function parseMoney(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function parsePositiveInt(value: unknown): number | null {
  const n = parseMoney(value);
  if (n === null || n <= 0) return null;
  return Math.round(n);
}

async function findClientProfileIdByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{ clientId: string | null; error: string | null }> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("email", email)
    .maybeSingle();

  if (error) return { clientId: null, error: error.message };
  if (!profile?.id) return { clientId: null, error: CLIENT_PROFILE_MISSING_MESSAGE };
  if ((profile.role ?? "").toLowerCase() !== "client") {
    return {
      clientId: null,
      error: `${CLIENT_PROFILE_MISSING_MESSAGE} (profile role is not client)`,
    };
  }

  return { clientId: profile.id as string, error: null };
}

function generateTemporaryPassword(): string {
  // 24 bytes => 32 chars in base64url. Strong enough for temporary password.
  return randomBytes(24).toString("base64url");
}

async function findAuthUserIdByEmail(
  supabaseAdmin: NonNullable<ReturnType<typeof createSupabaseAdminClient>["supabase"]>,
  email: string
): Promise<{ userId: string | null; error: string | null }> {
  // Supabase JS doesn't expose getUserByEmail in all versions; listUsers is the most compatible.
  const perPage = 1000;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) return { userId: null, error: error.message };
    const users = data?.users ?? [];
    const match = users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (match?.id) return { userId: match.id, error: null };
    if (users.length < perPage) break; // no more pages
  }
  return { userId: null, error: null };
}

async function ensureClientProfileId(
  supabase: SupabaseClient,
  email: string,
  fullName: string,
  phoneFields: ProfilePhoneFields
): Promise<{
  clientId: string | null;
  createdClient: boolean;
  error: string | null;
  code?: "validation" | "server";
}> {
  const normalizedEmail = email.trim().toLowerCase();

  const byPhone = await findProfileIdByNormalizedPhone(
    supabase,
    phoneFields.phoneNormalized
  );
  if (byPhone.error) {
    return {
      clientId: null,
      createdClient: false,
      error: byPhone.error,
      code: "server",
    };
  }

  if (byPhone.profileId) {
    const role = (byPhone.role ?? "").toLowerCase();
    if (role && role !== "client") {
      return {
        clientId: null,
        createdClient: false,
        error: "Phone belongs to a non-client profile",
        code: "validation",
      };
    }

    const { error: cpError } = await supabase
      .from("client_profiles")
      .upsert(
        { profile_id: byPhone.profileId, client_type: "private" },
        { onConflict: "profile_id" }
      );
    if (cpError) {
      return {
        clientId: null,
        createdClient: false,
        error: cpError.message,
        code: "server",
      };
    }

    return {
      clientId: byPhone.profileId,
      createdClient: false,
      error: null,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    return {
      clientId: null,
      createdClient: false,
      error: error.message,
      code: "server",
    };
  }

  if (profile?.id) {
    const role = (profile.role ?? "").toLowerCase();
    if (role && role !== "client") {
      return {
        clientId: null,
        createdClient: false,
        error: "Email belongs to a non-client profile",
        code: "validation",
      };
    }

    const { error: cpError } = await supabase
      .from("client_profiles")
      .upsert(
        { profile_id: profile.id, client_type: "private" },
        { onConflict: "profile_id" }
      );
    if (cpError) {
      return {
        clientId: null,
        createdClient: false,
        error: cpError.message,
        code: "server",
      };
    }

    return { clientId: profile.id as string, createdClient: false, error: null };
  }

  const duplicateCheck = await checkDuplicateProfilePhone(
    supabase,
    phoneFields.phoneNormalized
  );
  if (duplicateCheck.error) {
    return {
      clientId: null,
      createdClient: false,
      error: duplicateCheck.error,
      code: "server",
    };
  }
  if (duplicateCheck.duplicate) {
    return {
      clientId: null,
      createdClient: false,
      error: DUPLICATE_PHONE_MESSAGE,
      code: "validation",
    };
  }

  const admin = createSupabaseAdminClient();
  if (!admin.supabase) {
    return {
      clientId: null,
      createdClient: false,
      error:
        "Cannot create new client automatically: service role key is not configured.",
      code: "server",
    };
  }

  const supabaseAdmin = admin.supabase;
  const password = generateTemporaryPassword();

  let userId: string | null = null;
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  });

  if (authError) {
    // If user already exists in Auth, attach profile rows.
    const msg = authError.message.toLowerCase();
    const looksLikeDuplicate =
      msg.includes("already") || msg.includes("registered") || msg.includes("exists");
    if (!looksLikeDuplicate) {
      console.error("ensureClientProfileId auth.createUser:", authError);
      return { clientId: null, createdClient: false, error: authError.message, code: "server" };
    }

    const { userId: existingId, error: findError } =
      await findAuthUserIdByEmail(supabaseAdmin, normalizedEmail);
    if (findError) {
      return { clientId: null, createdClient: false, error: findError, code: "server" };
    }
    if (!existingId) {
      return {
        clientId: null,
        createdClient: false,
        error: "Auth user already exists, but could not be resolved by email.",
        code: "server",
      };
    }
    userId = existingId;
  } else {
    userId = authData.user.id;
  }

  if (!userId) {
    return { clientId: null, createdClient: false, error: "Failed to create client", code: "server" };
  }

  const profileResult = await upsertProfileForAuthUser(supabaseAdmin, {
    id: userId,
    email: normalizedEmail,
    full_name: fullName.trim(),
    phone: phoneFields.phone,
    phone_normalized: phoneFields.phoneNormalized,
    role: "client",
  });

  if (profileResult.error) {
    if (isPhoneNormalizedDuplicateError(profileResult.error)) {
      return {
        clientId: null,
        createdClient: false,
        error: DUPLICATE_PHONE_MESSAGE,
        code: "validation",
      };
    }
    return {
      clientId: null,
      createdClient: false,
      error: profileResult.error,
      code: "server",
    };
  }

  const { error: clientProfileError } = await supabaseAdmin
    .from("client_profiles")
    .upsert({ profile_id: userId, client_type: "private" }, { onConflict: "profile_id" });

  if (clientProfileError) {
    return { clientId: null, createdClient: false, error: clientProfileError.message, code: "server" };
  }

  return { clientId: userId, createdClient: true, error: null };
}

function validateServiceDetails(
  serviceType: OrderServiceType,
  serviceDetails: Record<string, unknown> | null | undefined,
  fieldErrors: Record<string, string>
): void {
  const d = serviceDetails ?? {};

  if (serviceType === "regular_cleaning") {
    const m2 = parsePositiveInt(d.propertySizeM2 ?? d.property_size_m2);
    if (!m2) {
      fieldErrors["serviceDetails.propertySizeM2"] =
        "Property size (m²) is required";
    }
    return;
  }

  if (serviceType === "move_in_out") {
    const m2 = parsePositiveInt(d.propertySizeM2 ?? d.property_size_m2);
    if (!m2) {
      fieldErrors["serviceDetails.propertySizeM2"] =
        "Property size (m²) is required";
    }
    return;
  }

  if (serviceType === "office_cleaning") {
    const m2 = parsePositiveInt(d.officeSizeM2 ?? d.office_size_m2);
    if (!m2) {
      fieldErrors["serviceDetails.officeSizeM2"] =
        "Office size (m²) is required";
    }
  }
}

export async function createAdminOrder(
  supabase: SupabaseClient,
  createdBy: string | null,
  input: {
    clientEmail: unknown;
    clientName: unknown;
    clientPhone: unknown;
    serviceType: unknown;
    scheduledDate: unknown;
    scheduledTime: unknown;
    street: unknown;
    city: unknown;
    houseNumber: unknown;
    apartment?: unknown;
    zip?: unknown;
    postalCode?: unknown;
    floor?: unknown;
    doorbellName?: unknown;
    estimatedPrice?: unknown;
    finalPrice?: unknown;
    useManualPrice?: unknown;
    serviceDetails?: unknown;
    customerComment?: unknown;
  }
): Promise<{
  order: Awaited<ReturnType<typeof getAdminOrderById>>["order"];
  error: string | null;
  code?: "validation" | "server";
  fieldErrors?: Record<string, string>;
  createdClient?: boolean;
  clientId?: string;
}> {
  const fieldErrors: Record<string, string> = {};

  const clientEmail = toTrimmedString(input.clientEmail).toLowerCase();
  const clientName = toTrimmedString(input.clientName);
  const clientPhone = toTrimmedString(input.clientPhone);
  const serviceType = toTrimmedString(input.serviceType) as OrderServiceType;
  const scheduledDate = toTrimmedString(input.scheduledDate);
  const scheduledTime = toTrimmedString(input.scheduledTime);
  const street = toTrimmedString(input.street);
  const city = toTrimmedString(input.city);
  const houseNumber = toTrimmedString(input.houseNumber);
  const apartment = toOptionalString(input.apartment);
  const zip = toOptionalString(input.zip ?? input.postalCode);
  const floor = toOptionalString(input.floor);
  const doorbellName = toOptionalString(input.doorbellName);
  const customerComment = toOptionalString(input.customerComment);
  const useManualPrice = Boolean(input.useManualPrice);
  const manualEstimatedPrice = parseMoney(input.estimatedPrice);
  const finalPrice = parseMoney(input.finalPrice);

  const serviceDetailsRaw = input.serviceDetails;
  const serviceDetails =
    serviceDetailsRaw &&
    typeof serviceDetailsRaw === "object" &&
    !Array.isArray(serviceDetailsRaw)
      ? (serviceDetailsRaw as Record<string, unknown>)
      : {};

  if (!clientEmail) fieldErrors.clientEmail = "Email is required";
  else if (!isValidEmail(clientEmail)) fieldErrors.clientEmail = "Enter a valid email";

  if (!clientName) fieldErrors.clientName = "Client name is required";

  const clientPhoneValidation = validateProfilePhone(clientPhone);
  if (!clientPhoneValidation.ok) {
    fieldErrors.clientPhone = clientPhoneValidation.error;
  }

  if (!serviceType || !SERVICE_TYPE_SET.has(serviceType)) {
    fieldErrors.serviceType = "Select a service type";
  }
  if (!scheduledDate) fieldErrors.scheduledDate = "Date is required";
  const normalizedScheduledTime = scheduledTime
    ? normalizeScheduleTime(scheduledTime)
    : null;
  if (!scheduledTime) fieldErrors.scheduledTime = "Time is required";
  else if (!normalizedScheduledTime) {
    fieldErrors.scheduledTime = "Time must be in 15-minute steps";
  }
  if (!street) fieldErrors.street = "Street is required";
  if (!city) fieldErrors.city = "City is required";
  if (!houseNumber) fieldErrors.houseNumber = "House number is required";

  if (serviceType && SERVICE_TYPE_SET.has(serviceType)) {
    validateServiceDetails(serviceType, serviceDetails, fieldErrors);
  }

  const pricingResult = supportsAutoPricing(serviceType)
    ? tryCalculateOrderPrice(serviceType, serviceDetails)
    : null;

  let estimatedPrice: number | null = null;
  let priceBreakdown: OrderPriceBreakdown | null = null;
  let estimatedDurationMinutes: number | null = null;

  if (pricingResult) {
    priceBreakdown = pricingResult.priceBreakdown;
    estimatedDurationMinutes = pricingResult.estimatedDurationMinutes;

    if (useManualPrice) {
      if (manualEstimatedPrice === null) {
        fieldErrors.estimatedPrice = "Enter a valid price";
      } else {
        estimatedPrice = manualEstimatedPrice;
        priceBreakdown = {
          ...priceBreakdown,
          manualOverride: true,
          manualPrice: manualEstimatedPrice,
        };
      }
    } else {
      estimatedPrice = pricingResult.estimatedPrice;
    }
  } else {
    if (manualEstimatedPrice === null) {
      fieldErrors.estimatedPrice =
        "Enter estimated price (auto-pricing not available for this service)";
    } else {
      estimatedPrice = manualEstimatedPrice;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      order: null,
      error: "Please fix the highlighted fields",
      code: "validation",
      fieldErrors,
    };
  }

  const ensured = await ensureClientProfileId(
    supabase,
    clientEmail,
    clientName,
    clientPhoneValidation.ok
      ? clientPhoneValidation.fields
      : { phone: "", phoneNormalized: "" }
  );

  if (ensured.error || !ensured.clientId) {
    return {
      order: null,
      error: ensured.error ?? "Failed to resolve client profile",
      code: ensured.code ?? "server",
    };
  }

  const clientId = ensured.clientId;

  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .insert({
      city,
      street,
      house_number: houseNumber,
      floor,
      apartment: apartment ?? doorbellName,
      postal_code: zip ?? customerComment,
    })
    .select("id")
    .single();

  if (addressError || !address?.id) {
    return {
      order: null,
      error: addressError?.message ?? "Failed to create address",
      code: "server",
    };
  }

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      client_id: clientId,
      address_id: address.id,
      service_type: serviceType,
      scheduled_date: scheduledDate,
      scheduled_time: normalizedScheduledTime!,
      status: DEFAULT_ORDER_STATUS,
      currency: DEFAULT_ORDER_CURRENCY,
      payment_status: DEFAULT_PAYMENT_STATUS,
      estimated_price: estimatedPrice,
      final_price: finalPrice,
      price_breakdown: priceBreakdown,
      estimated_duration_minutes: estimatedDurationMinutes,
      created_by: createdBy ?? clientId,
    })
    .select("id, service_type")
    .single();

  if (orderError || !createdOrder?.id) {
    return {
      order: null,
      error: orderError?.message ?? "Order was not created",
      code: "server",
    };
  }

  const orderId = createdOrder.id;
  const detailTable =
    getDetailTableForService(serviceType) ??
    ORDER_SERVICE_DETAIL_TABLE[serviceType];

  if (!detailTable) {
    return {
      order: null,
      error: `Unsupported service type: ${serviceType}`,
      code: "validation",
    };
  }

  const detailRow = {
    order_id: orderId,
    ...mapCreateServiceDetailsToDbRow(serviceType, serviceDetails),
  };

  const { error: detailError } = await supabase.from(detailTable).insert(detailRow);

  if (detailError) {
    return { order: null, error: detailError.message, code: "server" };
  }

  const result = await getAdminOrderById(String(orderId));
  return {
    ...result,
    createdClient: ensured.createdClient,
    clientId,
  };
}
