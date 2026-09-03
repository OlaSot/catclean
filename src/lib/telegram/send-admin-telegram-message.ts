export async function sendAdminTelegramMessage(lines: string[]): Promise<{ sent: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!token || !chatId) return { sent: false };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), disable_web_page_preview: true }),
    });
    if (!response.ok) {
      console.error("sendAdminTelegramMessage:", await response.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error("sendAdminTelegramMessage:", error);
    return { sent: false };
  }
}
