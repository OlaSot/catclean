import type { AdminOrderDetail } from "@/entities/order/admin-order-detail.types";
import type { AdminOrderServiceDetails } from "@/entities/order/admin-order-service-details.types";
import OrderServiceDetailsCard from "@/features/orders/components/OrderServiceDetailsCard";

type AdminOrderServiceDetailsCardProps = {
  serviceLabel: string;
  serviceDetails: AdminOrderServiceDetails | null;
  operationalNotes: AdminOrderDetail["operationalNotes"];
};

export default function AdminOrderServiceDetailsCard({
  serviceLabel,
  serviceDetails,
  operationalNotes,
}: AdminOrderServiceDetailsCardProps) {
  return (
    <OrderServiceDetailsCard
      serviceLabel={serviceLabel}
      serviceDetails={serviceDetails}
      audience="admin"
      operationalNotes={{
        accessNotes: operationalNotes.accessNotes,
        petsInfo: operationalNotes.petsInfo,
        suppliesNote: operationalNotes.suppliesNote,
        equipmentNote: operationalNotes.equipmentNote,
      }}
      adminOperationalExtras={{
        manualDiscount: operationalNotes.manualDiscount,
        manualSurcharge: operationalNotes.manualSurcharge,
        priceBreakdown: operationalNotes.priceBreakdown,
        internalNote: operationalNotes.internalNote,
      }}
    />
  );
}
