import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import { t } from "@/lib/i18n/translations";
import { generateConversationResponse, extractQualification } from "@/lib/conversation/qualifier";
import { updateLead } from "@/lib/services/google-sheets";
import { scoreLead } from "@/lib/scoring/lead-scorer";
import type { Lead } from "@/lib/types/lead";

/**
 * Generates TwiML for an AI-powered voice conversation.
 * Uses Twilio <Gather> for speech input + <Say> for AI responses.
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
  <Gather input="speech" action="${escapeXml(gatherUrl)}" method="POST" speechTimeout="auto" language="${language}" enhanced="true" timeout="8">
    <Say voice="${voice}" language="${language}">${escapeXml(message)}</Say>
  </Gather>
  <Say voice="${voice}" language="${language}">${escapeXml(
    lang === "fr"
      ? "Je vais vous envoyer un texto avec un lien pour réserver. Merci et bonne journée!"
      : "I'll send you a text with a booking link. Thank you and have a great day!"
  )}</Say>
</Response>`;
}

/**
 * Process a voice turn: take what the lead said, generate AI response,
 * and return TwiML for the next turn.
 */
export async function processVoiceTurn(
  lead: Lead,
  speechResult: string,
  turnCount: number
): Promise<{ twiml: string; updatedLead: Lead }> {
  const lang = lead.language;
  const log = logger.child({ leadId: lead.id, turn: turnCount });

  // Record what the lead said
  lead.conversationHistory.push({
    role: "lead",
    channel: "voice",
    content: speechResult,
    timestamp: new Date().toISOString(),
  });

  log.info({ speech: speechResult }, "Lead speech received");

  let aiResponse: string;

  if (turnCount >= 5) {
    // Final turn — wrap up
    aiResponse = lang === "fr"
      ? `Merci beaucoup ${lead.firstName}! Je vais vous envoyer un texto avec un lien pour réserver votre consultation gratuite. Au plaisir!`
      : `Thank you so much ${lead.firstName}! I'll send you a text with a link to book your free consultation. Talk soon!`;
  } else {
    // Generate AI response — single OpenAI call, fast
    aiResponse = await generateConversationResponse(lead, speechResult, "voice");
  }

  // Record agent response
  lead.conversationHistory.push({
    role: "agent",
    channel: "voice",
    content: aiResponse,
    timestamp: new Date().toISOString(),
  });

  // On last turn or every 2 turns, extract qualification
  const isLastTurn = turnCount >= 5;
  if (isLastTurn || turnCount % 2 === 0) {
    try {
      const qualification = await extractQualification(lead);
      lead.qualification = { ...lead.qualification, ...qualification };
      const { total } = scoreLead(lead);
      lead.score = total;
      log.info({ score: total, type: lead.qualification.type, intent: lead.qualification.intent }, "Qualification updated");
    } catch (err) {
      log.warn({ error: String(err) }, "Qualification extraction failed");
    }
  }

  // Save conversation + qualification to CRM
  updateLead(lead.id, {
    conversationHistory: lead.conversationHistory,
    qualification: lead.qualification,
    score: lead.score,
    pipelineEvents: [
      ...lead.pipelineEvents,
      {
        step: `voice_turn_${turnCount}`,
        status: "success",
        timestamp: new Date().toISOString(),
        detail: `Lead: "${speechResult.substring(0, 40)}..." → AI responded. Score: ${lead.score}`,
      },
    ],
  }).catch((err) => log.warn({ error: String(err) }, "CRM update failed during call"));
  const voice = lang === "fr" ? "Polly.Lea" : "Polly.Joanna";
  const language = lang === "fr" ? "fr-CA" : "en-US";

  let twiml: string;
  if (isLastTurn) {
    twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${language}">${escapeXml(aiResponse)}</Say>
</Response>`;
  } else {
    const gatherUrl = `${env.APP_URL()}/api/webhooks/twilio/voice?leadId=${lead.id}&turn=${turnCount + 1}`;
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
