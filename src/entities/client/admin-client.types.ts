import type { ClientType } from "@/lib/constants/client-type";

export type AdminClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  clientType: ClientType | null;
  companyName: string | null;
  internalNote: string | null;
  ordersCount: number;
  lastOrderDate: string | null;
};
