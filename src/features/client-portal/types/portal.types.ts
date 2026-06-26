import type { OrderStatus } from "@/entities/order/order.types";
import type { PortalServiceId } from "../lib/service-catalog";

export type PortalOrderStatus =
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "awaiting_confirmation";

export type PortalTimelineStep = {
  id: string;
  label: string;
  description?: string;
  state: "done" | "current" | "upcoming";
  at?: string;
};

export type PortalOrder = {
  id: string;
  serviceId: PortalServiceId;
  serviceName: string;
  scheduledDate: string;
  dayLabel: string;
  timeRange: string;
  status: PortalOrderStatus;
  statusLabel: string;
  apiStatus: OrderStatus;
  price: number;
  currency: "EUR";
  address: {
    line: string;
    city: string;
    floor: string | null;
    apartment: string | null;
  };
  cleaner: {
    id: string;
    name: string;
    avatarUrl: string | null;
    phone: string;
  } | null;
  timeline: PortalTimelineStep[];
  included: string[];
  extras: string[];
};

export type PortalOrderDetail = PortalOrder & {
  customerComment: string | null;
  canCancel: boolean;
  canReschedule: boolean;
  canLeaveReview: boolean;
  canOpenComplaint: boolean;
};

export type PortalClientProfile = {
  firstName: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  language: "English" | "Deutsch";
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
};

export type PortalSavedAddress = {
  id: string;
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  city: string;
  floor: string;
  accessNotes: string;
  label: string;
  lastUsedAt: string;
  orderCount: number;
  isDefault: boolean;
};

export type PortalPreferredCleaner = {
  id: string;
  name: string;
  avatarUrl: string | null;
  completedOrders: number;
  averageRating: number | null;
  bio: string;
};

export type PortalNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  orderId?: string;
};

export type PortalDashboardStats = {
  completedCleanings: number;
  upcomingBookings: number;
  lastBookingDate: string | null;
  lastBookingService: string | null;
  favoriteService: string | null;
  averageRating: number | null;
};
