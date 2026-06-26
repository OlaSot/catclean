import type { ClientOrderDetail } from "@/entities/order/client-order.types";
import { mapServiceTypeToPortalId } from "@/features/client-portal/lib/portal-order.mapper";

/** Shared address prefill shape for booking wizards. */
export type RepeatBookingAddressPrefill = {
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
  accessNotes: string;
};

export type RepeatBookingContactPrefill = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export type RepeatBookingPrefill = {
  orderId: string;
  serviceId: ReturnType<typeof mapServiceTypeToPortalId>;
  address: RepeatBookingAddressPrefill;
  contact: RepeatBookingContactPrefill;
  petsInfo: string | null;
  customerComment: string | null;
};

type WizardAddressFields = {
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
};

type WizardContactFields = {
  name: string;
  phone: string;
  email: string;
  notes?: string;
  customerComment?: string;
};

export function mapOrderToRepeatPrefill(order: ClientOrderDetail): RepeatBookingPrefill {
  const street = order.address.street !== "—" ? order.address.street : "";
  const house = order.address.house !== "—" ? order.address.house : "";

  return {
    orderId: order.routeId,
    serviceId: mapServiceTypeToPortalId(order.serviceType),
    address: {
      street,
      houseNumber: house,
      apartment: "",
      zip: "",
      city: order.address.city !== "—" ? order.address.city : "",
      floor: order.address.floor ?? "",
      accessNotes: order.operationalNotes.accessNotes ?? "",
    },
    contact: {
      name: "",
      phone: "",
      email: "",
      notes: order.customerComment ?? "",
    },
    petsInfo: order.operationalNotes.petsInfo,
    customerComment: order.customerComment,
  };
}

/** Merge repeat prefill into wizard initial state — schedule left empty for new selection. */
export function applyAddressPrefill<
  T extends { address: WizardAddressFields },
>(state: T, prefill: RepeatBookingPrefill): T {
  return {
    ...state,
    address: {
      ...state.address,
      street: prefill.address.street || state.address.street,
      houseNumber: prefill.address.houseNumber || state.address.houseNumber,
      apartment: prefill.address.apartment || state.address.apartment,
      zip: prefill.address.zip || state.address.zip,
      city: prefill.address.city || state.address.city,
      floor: prefill.address.floor || state.address.floor,
    },
  };
}

export function applyContactPrefill<
  T extends { contact: WizardContactFields },
>(state: T, prefill: RepeatBookingPrefill): T {
  const note =
    prefill.contact.notes || prefill.customerComment || state.contact.notes || "";

  return {
    ...state,
    contact: {
      ...state.contact,
      name: prefill.contact.name || state.contact.name,
      phone: prefill.contact.phone || state.contact.phone,
      email: prefill.contact.email || state.contact.email,
      ...(state.contact.notes !== undefined ? { notes: note } : {}),
      ...(state.contact.customerComment !== undefined
        ? { customerComment: prefill.customerComment ?? state.contact.customerComment }
        : {}),
    },
  };
}

// TODO: map serviceDetails.extras/enhancements into wizard-specific enhancement toggles
// TODO: map propertyType/propertySizeM2 from serviceDetails when repeat prefill is extended
// TODO: prefill upholstery/window item selections from prior order serviceDetails
