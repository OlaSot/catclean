import Link from "next/link";
import CreateOrderForm from "@/features/orders/components/CreateOrderForm";
import {
  ADMIN_PAGE_STACK_CLASS,
  ADMIN_PAGE_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_CLASS,
} from "@/lib/admin-styles";

export default function AdminCreateOrderPage() {
  return (
    <div className={ADMIN_PAGE_STACK_CLASS}>
      <div className="mx-auto w-full max-w-3xl">
        <div>
          <Link
            href="/app/admin/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#34597E]"
          >
            <span aria-hidden>←</span>
            Назад к заказам
          </Link>

          <h1 className={`mt-4 ${ADMIN_PAGE_TITLE_CLASS}`}>
            Новый заказ
          </h1>
          <p className={ADMIN_PAGE_SUBTITLE_CLASS}>
            Привяжите существующий профиль клиента, затем добавьте адрес и расписание.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
          <CreateOrderForm />
        </div>
      </div>
    </div>
  );
}
