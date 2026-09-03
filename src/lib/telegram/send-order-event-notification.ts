import { sendAdminTelegramMessage } from "./send-admin-telegram-message";

export function sendOrderConfirmedTelegramNotification(input: {
  orderNumber: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  adminUrl: string;
}) {
  return sendAdminTelegramMessage([
    `✅ Клиент подтвердил заказ #${input.orderNumber}`,
    "",
    input.scheduledDate
      ? `Дата: ${input.scheduledDate}${input.scheduledTime ? `, ${input.scheduledTime.slice(0, 5)}` : ""}`
      : "Дата: не указана",
    "Статус: подтверждён клиентом",
    "",
    `Открыть заказ: ${input.adminUrl}`,
  ]);
}

export function sendOrderCancelledTelegramNotification(input: {
  orderNumber: string;
  policyLabel: string;
  feeAmount: number;
  currency: string;
  adminUrl: string;
}) {
  const fee = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: input.currency || "EUR",
  }).format(input.feeAmount);
  return sendAdminTelegramMessage([
    `❌ Клиент отменил заказ #${input.orderNumber}`,
    "",
    `Условие отмены: ${input.policyLabel}`,
    `Удержание: ${fee}`,
    "Статус: отменён клиентом",
    "",
    `Открыть заказ: ${input.adminUrl}`,
  ]);
}
