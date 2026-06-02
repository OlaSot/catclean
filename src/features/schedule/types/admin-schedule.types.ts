import type { OrderStatus } from "@/entities/order/order.types";

export type AdminScheduleCleaner = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string | null;
  isAcceptingOrders: boolean;
  maxDailyHours: number;
  maxOrdersPerDay: number;
  availabilityStatus:
    | "available"
    | "unavailable"
    | "vacation"
    | "sick"
    | "preferred_day_off"
    | null;
  availabilityNote: string | null;
};

export type AdminScheduleOrderAddress = {
  city: string;
  line: string;
};

export type AdminScheduleOrderClient = {
  name: string;
  email: string | null;
  phone: string | null;
};

export type AdminScheduleOrder = {
  id: string;
  displayId: string;
  status: OrderStatus | string;
  statusLabel: string;
  serviceType: string;
  serviceTypeLabel: string;
  scheduledDate: string;
  scheduledTime: string;
  startMinutes: number | null;
  estimatedDurationMinutes: number;
  address: AdminScheduleOrderAddress;
  client: AdminScheduleOrderClient;
  price: number;
  currency: string;
};

export type AdminScheduleCleanerRow = {
  cleaner: AdminScheduleCleaner;
  orders: AdminScheduleOrder[];
  totalOrdersToday: number;
  totalHoursToday: number;
  hasOverlap: boolean;
  isFree: boolean;
  exceedsMaxHours: boolean;
  exceedsMaxOrders: boolean;
};

export type AdminScheduleData = {
  date: string;
  cleaners: AdminScheduleCleanerRow[];
  unassignedOrders: AdminScheduleOrder[];
};

export type AdminScheduleApiResponse = {
  data: AdminScheduleData | null;
  error: string | null;
};
