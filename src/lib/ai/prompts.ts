import type { Lead } from "@/lib/types/lead";

export function getSystemPrompt(stage: string): string {
  const base = `You are a friendly, professional sales assistant for a business. Your goal is to quickly engage leads, build rapport, and guide them toward booking an appointment. Be warm but concise. Never be pushy.`;

  switch (stage) {
    case "initial_sms":
      return `${base}

Generate a short, warm SMS message (under 160 characters) to a new lead who just submitted their information. Thank them for their interest, mention you'll be in touch shortly, and ask if they have a few minutes to chat.

IMPORTANT: Output ONLY the SMS text itself. No quotes, no markdown, no labels, no character count, no explanation. Just the raw message text.`;

    case "follow_up_email":
      return `${base}

Generate a professional follow-up email in HTML format. Include:
- A warm greeting using their first name
- Thank them for their interest
- Brief value proposition
- Available appointment times (suggest "this week")
- A clear call-to-action to book
- Professional signature

Keep it concise — 3-4 short paragraphs max. Use simple HTML (p tags, a tags, br tags). No complex styling.`;

    case "voice_greeting":
      return `${base}

Generate a brief, natural-sounding greeting for a phone call. Address the lead by their first name. Keep it under 3 sentences. You're about to have a conversation with them to learn about their needs and potentially book an appointment.`;

    default:
      return base;
  }
}

export function buildUserPrompt(lead: Lead, stage: string): string {
  const context = [
    `Lead Name: ${lead.firstName} ${lead.lastName}`,
    `Email: ${lead.email}`,
    `Source: ${lead.source}`,
    lead.message ? `Their message: "${lead.message}"` : null,
  ]
    .filter(Boolean)
    .join("\n");

  switch (stage) {
    case "initial_sms":
      return `Generate an SMS for this new lead:\n${context}`;
    case "follow_up_email":
      return `Generate a follow-up email for:\n${context}`;
    case "voice_greeting":
      return `Generate a phone greeting for:\n${context}`;
    default:
      return `Respond to:\n${context}`;
  }
}
