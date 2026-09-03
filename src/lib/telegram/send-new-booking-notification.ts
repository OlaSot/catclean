import { sendAdminTelegramMessage } from "./send-admin-telegram-message";

type NewBookingTelegramInput = {
  orderNumber: string;
  service: string;
  scheduledDate: string;
  scheduledTime: string;
  zip: string;
  city: string;
  estimatedPrice: number;
  currency: string;
  adminUrl?: string | null;
  isRepeat?: boolean;
};

export async function sendNewBookingTelegramNotification(
  input: NewBookingTelegramInput
): Promise<{ sent: boolean }> {
  const price = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: input.currency || "EUR",
  }).format(input.estimatedPrice);
  const lines = [
    input.isRepeat
      ? `🔁 Клиент повторил заказ #${input.orderNumber}`
      : `🧹 Новый заказ #${input.orderNumber}`,
    "",
    `Услуга: ${input.service}`,
    `Дата: ${input.scheduledDate}, ${input.scheduledTime}`,
    `Район: ${input.zip} ${input.city}`,
    `Стоимость: ${price}`,
    "Статус: ожидает подтверждения клиента",
  ];
  if (input.adminUrl) lines.push("", `Открыть заказ: ${input.adminUrl}`);

  return sendAdminTelegramMessage(lines);
}
