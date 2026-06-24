import { Suspense } from "react";
import AdminOrdersList from "@/features/orders/components/AdminOrdersList";

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Загрузка заказов...
        </div>
      }
    >
      <AdminOrdersList />
    </Suspense>
  );
}
