export type NotificationItem = {
  id: string;
  userId: string;
  roleTarget: string;
  type: string;
  title: string;
  message: string | null;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsApiResponse = {
  data: NotificationItem[] | null;
  error: string | null;
  meta?: { isStaff?: boolean };
};

export type NotificationMarkReadApiResponse = {
  data: { id: string } | null;
  error: string | null;
};

export type NotificationsReadAllApiResponse = {
  data: { ok: true } | null;
  error: string | null;
};

