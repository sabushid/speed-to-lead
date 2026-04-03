import { NextRequest, NextResponse } from "next/server";
import { getLeads, updateLead } from "@/lib/services/google-sheets";
import { sendSms } from "@/lib/services/twilio";
import { generateConversationResponse, extractQualification } from "@/lib/conversation/qualifier";
import { scoreLead } from "@/lib/scoring/lead-scorer";
import { detectLanguage } from "@/lib/i18n/translations";
import { logger } from "@/lib/utils/logger";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries()) as Record<string, string>;

    // Handle inbound SMS
    if (body.Body && body.From) {
      logger.info({ from: body.From, body: body.Body }, "Inbound SMS received");

      const leads = await getLeads();
      const lead = leads.find(
        (l) => l.phone === body.From || `+1${l.phone}` === body.From || l.phone === body.From.replace("+1", "")
      );

      if (lead) {
        // Detect language from their reply
        const detectedLang = detectLanguage(body.Body);
        if (detectedLang !== lead.language) {
          lead.language = detectedLang;
        }

        // Record inbound message
        lead.conversationHistory.push({
          role: "lead",
          channel: "sms",
          content: body.Body,
          timestamp: new Date().toISOString(),
        });

        // Generate AI response
        const aiResponse = await generateConversationResponse(
          lead,
          body.Body,
          "sms"
        );

        // Send response
        await sendSms(body.From, aiResponse);

        // Record outbound
        lead.conversationHistory.push({
          role: "agent",
          channel: "sms",
          content: aiResponse,
          timestamp: new Date().toISOString(),
        });

        // Update qualification from conversation
        const qualification = await extractQualification(lead);
        lead.qualification = { ...lead.qualification, ...qualification };

        // Re-score
        const { total } = scoreLead(lead);
        lead.score = total;

        // Save everything
        await updateLead(lead.id, {
          conversationHistory: lead.conversationHistory,
          qualification: lead.qualification,
          score: lead.score,
          lastContactedAt: new Date().toISOString(),
          language: lead.language,
          pipelineEvents: [
            ...lead.pipelineEvents,
            {
              step: "inbound_sms",
              status: "success",
              timestamp: new Date().toISOString(),
              detail: `Lead: "${body.Body.substring(0, 50)}" → AI replied`,
            },
          ],
        });
      }

      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Handle call status callbacks
    if (body.CallStatus) {
      logger.info({ callSid: body.CallSid, status: body.CallStatus }, "Call status update");
    }

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (error) {
    logger.error({ error: String(error) }, "Twilio webhook error");
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
