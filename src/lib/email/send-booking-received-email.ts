import {
  getBookingEmailFrom,
  getEmailDeliveryTo,
  getResendClient,
} from "@/lib/email/resend-client";
import {
  EMAIL_LOGO_CID_SRC,
  EMAIL_LOGO_PUBLIC_PATH,
  buildBookingReceivedEmailHtml,
  buildBookingReceivedEmailText,
  type BookingReceivedEmailContent,
} from "@/lib/email/booking-received-email-html";
import { getEmailLogoAttachment } from "@/lib/email/email-logo";

export type BookingReceivedEmailInput = BookingReceivedEmailContent & {
  to: string;
};

export async function sendBookingReceivedEmail(
  input: BookingReceivedEmailInput
): Promise<{ sent: boolean }> {
  const resend = getResendClient();
  const to = input.to.trim().toLowerCase();
  if (!resend || !to) return { sent: false };

  const from = getBookingEmailFrom();
  const deliveryTo = getEmailDeliveryTo(to, from);

  const logo = await getEmailLogoAttachment();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const hostedLogo =
    site && /^https:\/\//i.test(site) ? `${site}${EMAIL_LOGO_PUBLIC_PATH}` : "";
  const logoSrc = hostedLogo || (logo ? EMAIL_LOGO_CID_SRC : "");
  const html = buildBookingReceivedEmailHtml(input, logoSrc);
  const text = buildBookingReceivedEmailText(input);

  const notify = process.env.RESEND_NOTIFY_TO?.trim();
  const bcc =
    notify && notify.toLowerCase() !== deliveryTo ? [notify] : undefined;

  const { error } = await resend.emails.send({
    from,
    to: deliveryTo,
    bcc,
    subject: `CatClean · Anfrage ${input.orderNumber} erhalten`,
    text,
    html,
    attachments: !hostedLogo && logo
      ? [
          {
            filename: logo.filename,
            content: logo.content,
            contentId: logo.contentId,
          },
        ]
      : undefined,
  });

  if (error) {
    console.error("sendBookingReceivedEmail:", error.message);
    return { sent: false };
  }

  return { sent: true };
}
