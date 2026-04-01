import { google } from "googleapis";
import { getGoogleAuth } from "./google-auth";
import { logger } from "@/lib/utils/logger";
import type { EmailResult } from "@/lib/types/services";

export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<EmailResult> {
  const auth = getGoogleAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const rawMessage = createRawEmail(to, subject, htmlBody);

  logger.info({ to, subject }, "Sending email via Gmail");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage,
    },
  });

  const messageId = response.data.id ?? "unknown";
  logger.info({ messageId }, "Email sent");

  return { messageId };
}

function createRawEmail(to: string, subject: string, html: string): string {
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ].join("\r\n");

  return Buffer.from(email).toString("base64url");
}
