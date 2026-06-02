"use server";

import { redirect } from "next/navigation";
import {
  CLIENT_PROFILE_MISSING_MESSAGE,
  type CreateOrderActionState,
} from "@/features/orders/types/create-order.types";
import {
  DEFAULT_ORDER_CURRENCY,
  DEFAULT_ORDER_STATUS,
  DEFAULT_PAYMENT_STATUS,
  ORDER_SERVICE_DETAIL_TABLE,
  ORDER_SERVICE_TYPES,
  type OrderServiceType,
} from "@/lib/constants/orders";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServer";

const SERVICE_TYPE_SET = new Set(
  ORDER_SERVICE_TYPES.map((item) => item.value)
);

type CreatedOrderRow = {
  id: number | string;
  service_type: string;
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidOrderId(id: unknown): id is number | string {
  if (id === null || id === undefined) return false;
  if (typeof id === "number") return Number.isFinite(id);
  if (typeof id === "string") return id.length > 0;
  return false;
}

function validateFormData(formData: FormData): CreateOrderActionState {
  const fieldErrors: CreateOrderActionState["fieldErrors"] = {};

  const clientEmail = getString(formData, "clientEmail");
  const clientName = getString(formData, "clientName");
  const clientPhone = getString(formData, "clientPhone");
  const serviceType = getString(formData, "serviceType");
  const scheduledDate = getString(formData, "scheduledDate");
  const scheduledTime = getString(formData, "scheduledTime");
  const street = getString(formData, "street");
  const city = getString(formData, "city");
  const houseNumber = getString(formData, "houseNumber");
  const estimatedPriceRaw = getString(formData, "estimatedPrice");

  if (!clientEmail) fieldErrors.clientEmail = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    fieldErrors.clientEmail = "Enter a valid email";
  }

  if (!clientName) fieldErrors.clientName = "Client name is required";
  if (!clientPhone) fieldErrors.clientPhone = "Phone is required";
  if (!serviceType || !SERVICE_TYPE_SET.has(serviceType as OrderServiceType)) {
    fieldErrors.serviceType = "Select a service type";
  }
  if (!scheduledDate) fieldErrors.scheduledDate = "Date is required";
  if (!scheduledTime) fieldErrors.scheduledTime = "Time is required";
  if (!street) fieldErrors.street = "Street is required";
  if (!city) fieldErrors.city = "City is required";
  if (!houseNumber) fieldErrors.houseNumber = "House number is required";

  const estimatedPrice = Number(estimatedPriceRaw);
  if (!estimatedPriceRaw || Number.isNaN(estimatedPrice) || estimatedPrice < 0) {
    fieldErrors.estimatedPrice = "Enter a valid price";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the highlighted fields", fieldErrors };
  }

  return { error: null, fieldErrors: {} };
}

async function findClientProfileByEmail(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  email: string
): Promise<{ clientId: string | null; error: string | null }> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return { clientId: null, error: error.message };
  }

  if (!profile?.id) {
    return { clientId: null, error: CLIENT_PROFILE_MISSING_MESSAGE };
  }

  if ((profile.role ?? "").toLowerCase() !== "client") {
    return {
      clientId: null,
      error: `${CLIENT_PROFILE_MISSING_MESSAGE} (profile role is not client)`,
    };
  }

  return { clientId: profile.id, error: null };
}

async function createOrderDetail(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  orderId: number | string,
  serviceType: OrderServiceType
): Promise<string | null> {
  if (!isValidOrderId(orderId)) {
    return "Order ID is missing; cannot create service details";
  }

  const detailTable = ORDER_SERVICE_DETAIL_TABLE[serviceType];
  if (!detailTable) {
    return `Unsupported service type: ${serviceType}`;
  }

  const { error } = await supabase
    .from(detailTable)
    .insert({ order_id: orderId });

  return error?.message ?? null;
}

export async function createOrderAction(
  _prevState: CreateOrderActionState,
  formData: FormData
): Promise<CreateOrderActionState> {
  const validation = validateFormData(formData);
  if (validation.error) return validation;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in", fieldErrors: {} };
  }

  const clientEmail = getString(formData, "clientEmail");
  const serviceType = getString(formData, "serviceType") as OrderServiceType;
  const scheduledDate = getString(formData, "scheduledDate");
  const scheduledTime = getString(formData, "scheduledTime");
  const street = getString(formData, "street");
  const city = getString(formData, "city");
  const houseNumber = getString(formData, "houseNumber");
  const floor = getString(formData, "floor");
  const doorbellName = getString(formData, "doorbellName");
  const customerComment = getString(formData, "customerComment");
  const estimatedPrice = Number(getString(formData, "estimatedPrice"));

  const { clientId, error: clientError } = await findClientProfileByEmail(
    supabase,
    clientEmail
  );

  if (clientError || !clientId) {
    return {
      error: clientError ?? CLIENT_PROFILE_MISSING_MESSAGE,
      fieldErrors: {},
    };
  }

  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .insert({
      city,
      street,
      house_number: houseNumber,
      floor: floor || null,
      apartment: doorbellName || null,
      postal_code: customerComment || null,
    })
    .select("id")
    .single();

  if (addressError || !address?.id) {
    return {
      error: addressError?.message ?? "Failed to create address",
      fieldErrors: {},
    };
  }

  const orderPayload = {
    client_id: clientId,
    address_id: address.id,
    service_type: serviceType,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
    status: DEFAULT_ORDER_STATUS,
    currency: DEFAULT_ORDER_CURRENCY,
    payment_status: DEFAULT_PAYMENT_STATUS,
    estimated_price: estimatedPrice,
    created_by: user.id,
  };

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id, service_type")
    .single();

  if (orderError) {
    return {
      error: orderError.message ?? "Order was not created",
      fieldErrors: {},
    };
  }

  const order = createdOrder as CreatedOrderRow | null;

  if (!order || !isValidOrderId(order.id)) {
    return {
      error: "Order was not created (missing order id)",
      fieldErrors: {},
    };
  }

  const detailServiceType = (
    SERVICE_TYPE_SET.has(order.service_type as OrderServiceType)
      ? order.service_type
      : serviceType
  ) as OrderServiceType;

  const detailError = await createOrderDetail(
    supabase,
    order.id,
    detailServiceType
  );

  if (detailError) {
    return { error: detailError, fieldErrors: {} };
  }

  redirect("/app/admin/orders");
}
