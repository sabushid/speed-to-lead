import { logger } from "@/lib/utils/logger";
import { getLeads, updateLead } from "@/lib/services/google-sheets";
import { sendSms } from "@/lib/services/twilio";
import { sendEmail } from "@/lib/services/gmail";
import { formatE164 } from "@/lib/utils/phone";
import { t } from "@/lib/i18n/translations";
import { env } from "@/lib/config/env";
import type { Lead } from "@/lib/types/lead";

interface FollowUpRule {
  name: string;
  delayHours: number;
  action: (lead: Lead) => Promise<void>;
  condition: (lead: Lead) => boolean;
}

const FOLLOW_UP_RULES: FollowUpRule[] = [
  {
    name: "follow_up_1_sms",
    delayHours: 24,
    condition: (lead) =>
      lead.followUpCount === 0 &&
      !lead.appointmentTime &&
      lead.status !== "converted" &&
      lead.status !== "lost",
    action: async (lead) => {
      const msg = t(lead.language).sms.followUp1(
        lead.firstName,
        `${env.APP_URL()}/book`
      );
      await sendSms(formatE164(lead.phone), msg);
    },
  },
  {
    name: "follow_up_2_sms",
    delayHours: 72,
    condition: (lead) =>
      lead.followUpCount === 1 &&
      !lead.appointmentTime &&
      lead.status !== "converted" &&
      lead.status !== "lost",
    action: async (lead) => {
      const msg = t(lead.language).sms.followUp2(lead.firstName);
      await sendSms(formatE164(lead.phone), msg);
    },
  },
  {
    name: "follow_up_3_email",
    delayHours: 120,
    condition: (lead) =>
      lead.followUpCount === 2 &&
      !lead.appointmentTime &&
      lead.status !== "converted" &&
      lead.status !== "lost",
    action: async (lead) => {
      const lang = lead.language;
      const bookingUrl = `${env.APP_URL()}/book`;
      const html =
        lang === "fr"
          ? `<p>Bonjour ${lead.firstName},</p><p>Nous voulions simplement faire un suivi. Si vous avez des questions sur l'immobilier à Montréal, Longueuil ou la Rive-Sud, nous sommes là pour vous aider.</p><p><a href="${bookingUrl}" style="background:#5400b1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Réserver une consultation</a></p><p>Cordialement,<br>L'équipe Rushanet</p>`
          : `<p>Hi ${lead.firstName},</p><p>Just wanted to follow up. If you have any questions about real estate in Montreal, Longueuil, or the South Shore, we're here to help.</p><p><a href="${bookingUrl}" style="background:#5400b1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Book a consultation</a></p><p>Best regards,<br>The Rushanet Team</p>`;
      const subject =
        lang === "fr"
          ? `${lead.firstName}, on est toujours là pour vous`
          : `${lead.firstName}, we're still here for you`;
      await sendEmail(lead.email, subject, html);
    },
  },
];

export async function processFollowUps(): Promise<number> {
  const leads = await getLeads();
  let processed = 0;

  for (const lead of leads) {
    const hoursSinceCreated =
      (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
    const lastContacted = lead.lastContactedAt
      ? (Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60)
      : hoursSinceCreated;

    for (const rule of FOLLOW_UP_RULES) {
      if (!rule.condition(lead)) continue;
      if (lastContacted < rule.delayHours) continue;

      try {
        logger.info(
          { leadId: lead.id, rule: rule.name },
          "Running follow-up"
        );
        await rule.action(lead);
        await updateLead(lead.id, {
          status: "follow_up",
          pipelineEvents: [
            ...lead.pipelineEvents,
            {
              step: rule.name,
              status: "success",
              timestamp: new Date().toISOString(),
              detail: `Follow-up #${lead.followUpCount + 1} sent`,
            },
          ],
        });
        processed++;
      } catch (error) {
        logger.error(
          { leadId: lead.id, rule: rule.name, error: String(error) },
          "Follow-up failed"
        );
      }
    }
  }

  return processed;
}
