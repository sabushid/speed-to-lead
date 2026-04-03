import { sendSms, initiateCallWithTwiml } from "@/lib/services/twilio";
import { sendEmail } from "@/lib/services/gmail";
import { updateLead } from "@/lib/services/google-sheets";
import { formatE164 } from "@/lib/utils/phone";
import { env } from "@/lib/config/env";
import { t, detectLanguage } from "@/lib/i18n/translations";
import { generateVoiceTwiml } from "@/lib/voice/agent";
import { scoreLead } from "@/lib/scoring/lead-scorer";
import { initiateCall } from "@/lib/services/twilio";
import type { Lead } from "@/lib/types/lead";
import type { StepResult } from "@/lib/types/pipeline";

export async function sendInitialSms(lead: Lead): Promise<StepResult> {
  const lang = lead.language;
  const bookingUrl = `${env.APP_URL()}/book`;
  const message = t(lang).sms.initial(lead.firstName, bookingUrl);
  const phone = formatE164(lead.phone);
  const { sid } = await sendSms(phone, message);

  lead.conversationHistory.push({
    role: "agent",
    channel: "sms",
    content: message,
    timestamp: new Date().toISOString(),
  });

  await updateLead(lead.id, { status: "contacted_sms" });
  return { success: true, detail: `SMS sent (SID: ${sid})` };
}

export async function sendFollowUpEmail(lead: Lead): Promise<StepResult> {
  const lang = lead.language;
  const bookingUrl = `${env.APP_URL()}/book`;
  const q = lead.qualification;

  const subject =
    q.type === "seller"
      ? t(lang).email.subjectSeller(lead.firstName)
      : t(lang).email.subject(lead.firstName);

  const html =
    lang === "fr"
      ? `<p>Bonjour ${lead.firstName},</p>
         <p>Merci de nous avoir contactés! Nous sommes spécialisés en immobilier à Montréal, Longueuil et la Rive-Sud.</p>
         <p>${q.type === "seller" ? "Nous aimerions vous aider à vendre votre propriété au meilleur prix." : "Nous aimerions vous aider à trouver la propriété parfaite."}</p>
         <p style="margin:24px 0;"><a href="${bookingUrl}" style="background:#5400b1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Réserver votre consultation gratuite</a></p>
         <p>Cordialement,<br>L'équipe Rushanet</p>`
      : `<p>Hi ${lead.firstName},</p>
         <p>Thanks for reaching out! We specialize in real estate across Montreal, Longueuil, and the South Shore.</p>
         <p>${q.type === "seller" ? "We'd love to help you sell your property for the best price." : "We'd love to help you find your perfect property."}</p>
         <p style="margin:24px 0;"><a href="${bookingUrl}" style="background:#5400b1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Book Your Free Consultation</a></p>
         <p>Best regards,<br>The Rushanet Team</p>`;

  const { messageId } = await sendEmail(lead.email, subject, html);

  lead.conversationHistory.push({
    role: "agent",
    channel: "email",
    content: subject,
    timestamp: new Date().toISOString(),
  });

  await updateLead(lead.id, { status: "contacted_email" });
  return { success: true, detail: `Email sent (ID: ${messageId})` };
}

export async function initiateVoiceCall(lead: Lead): Promise<StepResult> {
  const lang = lead.language;
  const greeting = t(lang).voice.greeting(lead.firstName);

  // Use Twilio <Gather> for interactive voice — webhook-based conversation
  const gatherUrl = `${env.APP_URL()}/api/webhooks/twilio/voice?leadId=${lead.id}&turn=1`;

  try {
    const twiml = generateVoiceTwiml(greeting, gatherUrl, lang);
    const phone = formatE164(lead.phone);

    const { sid } = await initiateCall(
      phone,
      `${env.APP_URL()}/api/webhooks/twilio/voice?leadId=${lead.id}&turn=0`
    );

    lead.conversationHistory.push({
      role: "agent",
      channel: "voice",
      content: greeting,
      timestamp: new Date().toISOString(),
    });

    await updateLead(lead.id, { status: "contacted_voice" });
    return { success: true, detail: `AI call initiated (SID: ${sid})` };
  } catch (error) {
    // Fallback: send SMS if call fails
    const fallbackMsg = t(lang).sms.missedCall(
      lead.firstName,
      `${env.APP_URL()}/book`
    );
    await sendSms(formatE164(lead.phone), fallbackMsg);
    return {
      success: false,
      detail: "Call failed — fallback SMS sent",
      error: String(error),
    };
  }
}

export async function qualifyAndScore(lead: Lead): Promise<StepResult> {
  // Detect language from message if not set
  if (lead.message) {
    lead.language = detectLanguage(lead.message);
  }

  // Initial qualification from message
  if (lead.message) {
    const lower = lead.message.toLowerCase();
    if (lower.includes("sell") || lower.includes("vend")) {
      lead.qualification.type = "seller";
    } else if (lower.includes("buy") || lower.includes("achet") || lower.includes("cherche")) {
      lead.qualification.type = "buyer";
    }

    // Area detection
    const areas = ["montreal", "montréal", "longueuil", "south shore", "rive-sud", "rive sud", "brossard", "saint-lambert"];
    for (const area of areas) {
      if (lower.includes(area)) {
        lead.qualification.area = area.charAt(0).toUpperCase() + area.slice(1);
        break;
      }
    }
  }

  // Score the lead
  const { total } = scoreLead(lead);
  lead.score = total;

  await updateLead(lead.id, {
    status: lead.qualification.type !== "unknown" ? "qualified" : lead.status,
  });

  return {
    success: true,
    detail: `Score: ${total}, Type: ${lead.qualification.type}, Intent: ${lead.qualification.intent}`,
  };
}

export async function updateCrmRecord(lead: Lead): Promise<StepResult> {
  await updateLead(lead.id, {
    pipelineEvents: [
      ...(lead.pipelineEvents ?? []),
      {
        step: "crm_final_update",
        status: "success",
        timestamp: new Date().toISOString(),
        detail: `Pipeline completed — Score: ${lead.score}, Type: ${lead.qualification.type}`,
      },
    ],
  });
  return { success: true, detail: "CRM record updated" };
}
