import {
  getBookingEmailFrom,
  getEmailDeliveryTo,
  getResendClient,
} from "@/lib/email/resend-client";

export async function sendClientAccessEmail(input: {
  to: string;
  accessUrl: string;
}): Promise<{ sent: boolean; error: string | null }> {
  const resend = getResendClient();
  const intendedTo = input.to.trim().toLowerCase();
  if (!resend || !intendedTo) {
    return { sent: false, error: "Email delivery is not configured" };
  }

  const from = getBookingEmailFrom();
  const deliveryTo = getEmailDeliveryTo(intendedTo, from);
  const { error } = await resend.emails.send({
    from,
    to: deliveryTo,
    subject: "CatClean · Zugang zu Ihren Buchungen",
    text: `Öffnen Sie Ihre CatClean-Buchungen über diesen sicheren Link:\n${input.accessUrl}\n\nDer Link kann nur einmal verwendet werden.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#20324a"><h1 style="font-size:24px">Ihre CatClean-Buchungen</h1><p>Über den folgenden sicheren Link gelangen Sie zu Ihrem Kundenbereich.</p><p style="margin:28px 0"><a href="${input.accessUrl}" style="background:#34597e;color:#fff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700">Meine Buchungen öffnen</a></p><p style="font-size:13px;color:#64748b">Der Link kann nur einmal verwendet werden.</p></div>`,
  });

  return error
    ? { sent: false, error: error.message }
    : { sent: true, error: null };
}
