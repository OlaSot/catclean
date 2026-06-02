export type AdminDashboardKpis = {
  totalOrders: number;
  todayOrders: number;
  searchingCleaner: number;
  inProgress: number;
  completedThisWeek: number;
  revenueThisWeek: number;
  currency: string;
};

export type AdminDashboardOrderRow = {
  orderId: string;
  displayId: string;
  status: string;
  statusLabel: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceType: string;
  serviceLabel: string;
  clientName: string;
  cleanerName: string | null;
  attentionReason: string | null;
};

export type AdminDashboardActivityItem = {
  id: string;
  orderId: string;
  orderDisplayId: string;
  oldStatus: string;
  newStatus: string;
  oldStatusLabel: string;
  newStatusLabel: string;
  isNote: boolean;
  actorName: string;
  comment: string | null;
  createdAt: string;
};

export type AdminDashboardData = {
  kpis: AdminDashboardKpis;
  attentionOrders: AdminDashboardOrderRow[];
  todaySchedule: AdminDashboardOrderRow[];
  recentActivity: AdminDashboardActivityItem[];
};

export type AdminDashboardApiResponse = {
  data: AdminDashboardData | null;
  error: string | null;
};
