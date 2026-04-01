import { sendSms, initiateCallWithTwiml } from "@/lib/services/twilio";
import { sendEmail } from "@/lib/services/gmail";
import { generateResponse } from "@/lib/ai/response-generator";
import { updateLead } from "@/lib/services/google-sheets";
import { formatE164 } from "@/lib/utils/phone";
import type { Lead } from "@/lib/types/lead";
import type { StepResult } from "@/lib/types/pipeline";

export async function sendInitialSms(lead: Lead): Promise<StepResult> {
  // Keep SMS short — Twilio trial prepends its own prefix
  const message = `Hi ${lead.firstName}! Thanks for your interest. We'll be in touch shortly.`;
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
  const html = await generateResponse(lead, "follow_up_email");
  const { messageId } = await sendEmail(
    lead.email,
    `Thanks for reaching out, ${lead.firstName}!`,
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
