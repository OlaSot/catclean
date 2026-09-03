import { readFile } from "node:fs/promises";
import path from "node:path";
import { EMAIL_LOGO_CID } from "@/lib/email/booking-received-email-html";

const LOGO_FILE = path.join(process.cwd(), "public", "email", "logo.png");

export async function getEmailLogoAttachment(): Promise<{
  filename: string;
  content: Buffer;
  contentId: string;
} | null> {
  try {
    const content = await readFile(LOGO_FILE);
    if (!content.length) return null;
    return {
      filename: "catclean-logo.png",
      content,
      contentId: EMAIL_LOGO_CID,
    };
  } catch {
    return null;
  }
}
