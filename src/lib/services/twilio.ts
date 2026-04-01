import Twilio from "twilio";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import type { SmsResult, CallResult } from "@/lib/types/services";

let client: ReturnType<typeof Twilio> | null = null;

function getClient() {
  if (!client) {
    client = Twilio(env.TWILIO_ACCOUNT_SID(), env.TWILIO_AUTH_TOKEN());
  }
  return client;
}

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const twilio = getClient();
  logger.info({ to, bodyLength: body.length }, "Sending SMS");

  const message = await twilio.messages.create({
    to,
    from: env.TWILIO_PHONE_NUMBER(),
    body,
  });

  logger.info({ sid: message.sid, status: message.status }, "SMS sent");
  return { sid: message.sid, status: message.status };
}

export async function initiateCall(
  to: string,
  twimlUrl: string
): Promise<CallResult> {
  const twilio = getClient();
  logger.info({ to }, "Initiating call");

  const call = await twilio.calls.create({
    to,
    from: env.TWILIO_PHONE_NUMBER(),
    url: twimlUrl,
    statusCallback: `${env.APP_URL()}/api/webhooks/twilio`,
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
  });

  logger.info({ sid: call.sid, status: call.status }, "Call initiated");
  return { sid: call.sid, status: call.status };
}

export function generateTwiml(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(message)}</Say>
</Response>`;
}

export function generateConnectTwiml(roomName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${env.LIVEKIT_URL()}" name="${escapeXml(roomName)}" />
  </Connect>
</Response>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
