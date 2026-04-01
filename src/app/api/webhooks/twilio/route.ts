import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/ai/response-generator";
import { sendSms } from "@/lib/services/twilio";
import { getLeads, updateLead } from "@/lib/services/google-sheets";
import { generateConnectTwiml } from "@/lib/services/twilio";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries()) as Record<string, string>;

    const { searchParams } = new URL(request.url);
    const room = searchParams.get("room");

    // If this is a call connection request with a room parameter,
    // return TwiML to connect to LiveKit
    if (room) {
      const twiml = generateConnectTwiml(room);
      return new NextResponse(twiml, {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Handle inbound SMS
    if (body.Body && body.From) {
      logger.info({ from: body.From }, "Inbound SMS received");

      // Find the lead by phone number
      const leads = await getLeads();
      const lead = leads.find(
        (l) => l.phone === body.From || `+1${l.phone}` === body.From
      );

      if (lead) {
        // Generate an AI response to their message
        const aiResponse = await generateResponse(
          { ...lead, message: body.Body },
          "sms_reply"
        );
        await sendSms(body.From, aiResponse);

        // Update pipeline events
        const events = [
          ...(lead.pipelineEvents ?? []),
          {
            step: "inbound_sms",
            status: "success" as const,
            timestamp: new Date().toISOString(),
            detail: `Received: "${body.Body}" — AI replied`,
          },
        ];
        await updateLead(lead.id, { pipelineEvents: events });
      }

      // Twilio expects a TwiML response even for SMS
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Handle call status callbacks
    if (body.CallStatus) {
      logger.info(
        { callSid: body.CallSid, status: body.CallStatus },
        "Call status update"
      );
    }

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (error) {
    logger.error({ error: String(error) }, "Twilio webhook error");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
