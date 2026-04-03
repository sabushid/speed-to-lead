import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import { t } from "@/lib/i18n/translations";
import { generateConversationResponse, extractQualification } from "@/lib/conversation/qualifier";
import { updateLead } from "@/lib/services/google-sheets";
import { getAvailableSlots, bookAppointment } from "@/lib/services/google-calendar";
import { sendSms } from "@/lib/services/twilio";
import { sendEmail } from "@/lib/services/gmail";
import { formatE164 } from "@/lib/utils/phone";
import { formatSlot } from "@/lib/utils/dates";
import { scoreLead } from "@/lib/scoring/lead-scorer";
import type { Lead, ConversationMessage } from "@/lib/types/lead";

/**
 * Generates TwiML for an AI-powered voice conversation.
 * Uses Twilio <Gather> for speech input + <Say> for AI responses.
 * Each turn: AI speaks → gathers lead response → webhooks back for next turn.
 */
export function generateVoiceTwiml(
  message: string,
  gatherUrl: string,
  lang: "en" | "fr"
): string {
  const voice = lang === "fr" ? "Polly.Lea" : "Polly.Joanna";
  const language = lang === "fr" ? "fr-CA" : "en-US";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${escapeXml(gatherUrl)}" method="POST" speechTimeout="3" language="${language}" enhanced="true">
    <Say voice="${voice}" language="${language}">${escapeXml(message)}</Say>
  </Gather>
  <Say voice="${voice}" language="${language}">${escapeXml(
    lang === "fr"
      ? "Je vais vous envoyer un texto avec un lien pour réserver. Merci!"
      : "I'll send you a text with a booking link. Thank you!"
  )}</Say>
</Response>`;
}

/**
 * Process a voice turn: take what the lead said, generate AI response,
 * update qualification, and return TwiML for the next turn.
 */
export async function processVoiceTurn(
  lead: Lead,
  speechResult: string,
  turnCount: number
): Promise<{ twiml: string; updatedLead: Lead }> {
  const lang = lead.language;
  const log = logger.child({ leadId: lead.id, turn: turnCount });

  // Record what the lead said
  const leadMsg: ConversationMessage = {
    role: "lead",
    channel: "voice",
    content: speechResult,
    timestamp: new Date().toISOString(),
  };
  lead.conversationHistory.push(leadMsg);

  log.info({ speech: speechResult }, "Lead speech received");

  // Generate AI response
  let aiResponse: string;

  if (turnCount >= 5) {
    // After 5 turns, wrap up and offer booking
    const slots = await getAvailableSlots(
      new Date().toISOString(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );
    if (slots.length > 0) {
      const slot = slots[0];
      aiResponse = t(lang).voice.bookingOffer;

      // Auto-book the first available slot
      try {
        const booking = await bookAppointment(lead, slot);
        await updateLead(lead.id, {
          status: "appointment_scheduled",
          appointmentTime: slot.start,
          calendarEventId: booking.eventId,
        });
        aiResponse = t(lang).voice.bookingConfirm(formatSlot(slot.start));

        // Send confirmations
        const phone = formatE164(lead.phone);
        const confirmMsg = t(lang).sms.appointmentConfirm(lead.firstName, formatSlot(slot.start));
        await sendSms(phone, confirmMsg);
      } catch (err) {
        log.error({ error: String(err) }, "Booking failed during call");
        aiResponse = t(lang).voice.noAnswer;
      }
    } else {
      aiResponse = t(lang).voice.noAnswer;
    }
  } else {
    aiResponse = await generateConversationResponse(lead, speechResult, "voice");
  }

  // Record agent response
  const agentMsg: ConversationMessage = {
    role: "agent",
    channel: "voice",
    content: aiResponse,
    timestamp: new Date().toISOString(),
  };
  lead.conversationHistory.push(agentMsg);

  // Extract and update qualification
  const qualification = await extractQualification(lead);
  lead.qualification = { ...lead.qualification, ...qualification };

  // Update lead score
  const { total } = scoreLead(lead);
  lead.score = total;

  // Save to CRM
  await updateLead(lead.id, {
    pipelineEvents: [
      ...lead.pipelineEvents,
      {
        step: `voice_turn_${turnCount}`,
        status: "success",
        timestamp: new Date().toISOString(),
        detail: `Lead: "${speechResult.substring(0, 50)}..." → AI responded`,
      },
    ],
  });

  // Generate next TwiML
  const gatherUrl = `${env.APP_URL()}/api/webhooks/twilio/voice?leadId=${lead.id}&turn=${turnCount + 1}`;

  const isLastTurn = turnCount >= 5;
  let twiml: string;

  if (isLastTurn) {
    // Final turn — say goodbye, no more gathering
    const voice = lang === "fr" ? "Polly.Lea" : "Polly.Joanna";
    const language = lang === "fr" ? "fr-CA" : "en-US";
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${language}">${escapeXml(aiResponse)}</Say>
  <Say voice="${voice}" language="${language}">${escapeXml(t(lang).voice.goodbye)}</Say>
</Response>`;
  } else {
    twiml = generateVoiceTwiml(aiResponse, gatherUrl, lang);
  }

  return { twiml, updatedLead: lead };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
