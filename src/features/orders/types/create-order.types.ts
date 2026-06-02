import type { CreateOrderServiceDetailsForm } from "./create-order-service-details.types";

export type CreateOrderFormValues = {
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  street: string;
  city: string;
  houseNumber: string;
  floor: string;
  doorbellName: string;
  estimatedPrice: string;
  finalPrice: string;
  useManualPrice: boolean;
  serviceDetails: CreateOrderServiceDetailsForm;
  customerComment: string;
};

export type CreateOrderActionState = {
  error: string | null;
  fieldErrors: Partial<Record<keyof CreateOrderFormValues, string>>;
};

export const CREATE_ORDER_INITIAL_STATE: CreateOrderActionState = {
  error: null,
  fieldErrors: {},
};

export const CLIENT_PROFILE_MISSING_MESSAGE =
  "Client profile does not exist yet. Please create client auth user first.";
