import {
  readLocalStorageJson,
  removeLocalStorageItem,
  writeLocalStorageJson,
} from "@/lib/helpers/localStorage";
import {
  EMPTY_CREATE_ORDER_SERVICE_DETAILS,
  type CreateOrderServiceDetailsForm,
} from "@/features/orders/types/create-order-service-details.types";
import type { CreateOrderFormValues } from "@/features/orders/types/create-order.types";

export const CREATE_ORDER_DRAFT_STORAGE_KEY = "catclean-create-order-draft";

export const EMPTY_CREATE_ORDER_FORM_VALUES: CreateOrderFormValues = {
  clientEmail: "",
  clientName: "",
  clientPhone: "",
  serviceType: "",
  scheduledDate: "",
  scheduledTime: "09:00",
  street: "",
  city: "",
  houseNumber: "",
  floor: "",
  doorbellName: "",
  estimatedPrice: "",
  finalPrice: "",
  useManualPrice: false,
  serviceDetails: { ...EMPTY_CREATE_ORDER_SERVICE_DETAILS },
  customerComment: "",
};

function isServiceDetailsForm(
  value: unknown
): value is CreateOrderServiceDetailsForm {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.propertySizeM2 === "string" &&
    typeof r.officeSizeM2 === "string" &&
    typeof r.cleaningIntensity === "string"
  );
}

function isCreateOrderFormValues(value: unknown): value is CreateOrderFormValues {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const baseKeys: (keyof CreateOrderFormValues)[] = [
    "clientEmail",
    "clientName",
    "clientPhone",
    "serviceType",
    "scheduledDate",
    "scheduledTime",
    "street",
    "city",
    "houseNumber",
    "floor",
    "doorbellName",
    "estimatedPrice",
    "finalPrice",
    "customerComment",
  ];
  if (!baseKeys.every((key) => typeof record[key] === "string")) {
    return false;
  }
  if (typeof record.useManualPrice !== "boolean") return false;
  return isServiceDetailsForm(record.serviceDetails);
}

export function loadCreateOrderDraft(): CreateOrderFormValues | null {
  const parsed = readLocalStorageJson(CREATE_ORDER_DRAFT_STORAGE_KEY);
  if (!isCreateOrderFormValues(parsed)) return null;
  return {
    ...parsed,
    serviceDetails: {
      ...EMPTY_CREATE_ORDER_SERVICE_DETAILS,
      ...parsed.serviceDetails,
    },
  };
}

export function saveCreateOrderDraft(values: CreateOrderFormValues): void {
  writeLocalStorageJson(CREATE_ORDER_DRAFT_STORAGE_KEY, values);
}

export function clearCreateOrderDraft(): void {
  removeLocalStorageItem(CREATE_ORDER_DRAFT_STORAGE_KEY);
}
