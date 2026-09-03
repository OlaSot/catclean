import type { ClientOrderDetail } from "@/entities/order/client-order.types";
import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import { mapServiceTypeToPortalId } from "@/features/client-portal/lib/portal-order.mapper";
import { isHannoverServiceArea } from "@/lib/booking/hannover-service-area";

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
  serviceDetails: AdminOrderServiceDetails | null;
  suppliesNote: string;
  equipmentNote: string;
};

type WizardAddressFields = {
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
  serviceAreaValidated?: boolean;
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
      apartment: order.address.apartment ?? "",
      zip: order.address.zip,
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
    serviceDetails: order.serviceDetails,
    suppliesNote: order.operationalNotes.suppliesNote ?? "",
    equipmentNote: order.operationalNotes.equipmentNote ?? "",
  };
}

/** Merge repeat prefill into wizard initial state — schedule left empty for new selection. */
export function applyAddressPrefill<
  T extends { address: WizardAddressFields },
>(state: T, prefill: RepeatBookingPrefill): T {
  const zip = prefill.address.zip || state.address.zip;
  const city = prefill.address.city || state.address.city;
  return {
    ...state,
    address: {
      ...state.address,
      street: prefill.address.street || state.address.street,
      houseNumber: prefill.address.houseNumber || state.address.houseNumber,
      apartment: prefill.address.apartment || state.address.apartment,
      zip,
      city,
      floor: prefill.address.floor || state.address.floor,
      serviceAreaValidated: isHannoverServiceArea(zip, city),
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

// TODO: prefill upholstery/window item selections from prior order serviceDetails
