export type AdminReviewListItem = {
  id: string;
  orderId: string;
  orderDisplayId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  cleanerId: string | null;
  cleanerName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
};
