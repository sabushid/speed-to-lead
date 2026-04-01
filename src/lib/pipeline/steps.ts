import { sendSms, initiateCallWithTwiml } from "@/lib/services/twilio";
import { sendEmail } from "@/lib/services/gmail";
import { updateLead } from "@/lib/services/google-sheets";
import { formatE164 } from "@/lib/utils/phone";
import { env } from "@/lib/config/env";
import type { Lead } from "@/lib/types/lead";
import type { StepResult } from "@/lib/types/pipeline";

export async function sendInitialSms(lead: Lead): Promise<StepResult> {
  const bookingUrl = `${env.APP_URL()}/book/${lead.id}`;
  const message = `Hi ${lead.firstName}! Thanks for reaching out. Book your appointment here: ${bookingUrl}`;
  const phone = formatE164(lead.phone);
  const { sid } = await sendSms(phone, message);
  await updateLead(lead.id, { status: "contacted_sms" });
  return { success: true, detail: `SMS sent (SID: ${sid})` };
}

export async function initiateVoiceCall(lead: Lead): Promise<StepResult> {
  const greeting = `Hi ${lead.firstName}, this is a quick call from our team. Thanks for reaching out to us! We'd love to help you. One of our team members will follow up with you shortly to schedule a time to chat. Have a great day!`;
  const phone = formatE164(lead.phone);
  const { sid } = await initiateCallWithTwiml(phone, greeting);

  await updateLead(lead.id, { status: "contacted_voice" });
  return { success: true, detail: `Call initiated (SID: ${sid})` };
}

export async function sendFollowUpEmail(lead: Lead): Promise<StepResult> {
  const bookingUrl = `${env.APP_URL()}/book/${lead.id}`;
  const html = `
    <p>Hi ${lead.firstName},</p>
    <p>Thanks so much for reaching out to us! We received your message and we're excited to connect with you.</p>
    <p>We'd love to set up a time to chat and learn more about how we can help. You can book an appointment at a time that works best for you:</p>
    <p style="margin: 24px 0;">
      <a href="${bookingUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        Book Your Appointment
      </a>
    </p>
    <p>Looking forward to speaking with you!</p>
    <p>Best regards,<br>The Team</p>
  `;
  const { messageId } = await sendEmail(
    lead.email,
    `${lead.firstName}, book your appointment with us!`,
    html
  );
  await updateLead(lead.id, { status: "contacted_email" });
  return { success: true, detail: `Email sent (ID: ${messageId})` };
}

export async function updateCrmRecord(lead: Lead): Promise<StepResult> {
  await updateLead(lead.id, {
    pipelineEvents: [
      ...(lead.pipelineEvents ?? []),
      {
        step: "crm_final_update",
        status: "success",
        timestamp: new Date().toISOString(),
        detail: "Pipeline completed — CRM record finalized",
      },
    ],
  });
  return { success: true, detail: "CRM record updated" };
}
