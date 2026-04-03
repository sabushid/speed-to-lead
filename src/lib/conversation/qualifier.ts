import OpenAI from "openai";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import type { Lead, QualificationData, ConversationMessage, LeadLanguage } from "@/lib/types/lead";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY() });
  }
  return client;
}

const SYSTEM_PROMPT_EN = `You are a friendly, professional real estate AI assistant for Rushanet, operating in Montreal, Longueuil, and the South Shore of Montreal.

Your goals:
1. Determine if the lead is BUYING or SELLING (or both)
2. Understand their BUDGET (buyers) or property details (sellers)
3. Identify their preferred AREA (Montreal, Longueuil, South Shore, or specific neighborhoods)
4. Assess their INTENT level (how soon they want to act)
5. Guide them toward booking a free consultation

Be conversational, warm, and concise. Never give long answers. Ask one question at a time.
Mention Montreal, Longueuil, and the South Shore naturally.
If they seem ready, suggest booking an appointment immediately.`;

const SYSTEM_PROMPT_FR = `Vous êtes un assistant IA immobilier amical et professionnel pour Rushanet, opérant à Montréal, Longueuil et la Rive-Sud de Montréal.

Vos objectifs:
1. Déterminer si le prospect ACHÈTE ou VEND (ou les deux)
2. Comprendre leur BUDGET (acheteurs) ou les détails de la propriété (vendeurs)
3. Identifier leur SECTEUR préféré (Montréal, Longueuil, Rive-Sud, ou quartiers spécifiques)
4. Évaluer leur niveau d'INTENTION (quand ils veulent agir)
5. Les guider vers la réservation d'une consultation gratuite

Soyez conversationnel, chaleureux et concis. Ne donnez jamais de longues réponses. Posez une question à la fois.
Mentionnez Montréal, Longueuil et la Rive-Sud naturellement.
S'ils semblent prêts, suggérez de réserver un rendez-vous immédiatement.`;

export async function generateConversationResponse(
  lead: Lead,
  newMessage: string,
  channel: "sms" | "voice"
): Promise<string> {
  const openai = getClient();
  const lang = lead.language;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN,
    },
    {
      role: "system",
      content: `Lead info: ${lead.firstName} ${lead.lastName}, phone: ${lead.phone}, email: ${lead.email}, source: ${lead.source}. Current qualification: type=${lead.qualification.type}, budget=${lead.qualification.budget || "unknown"}, area=${lead.qualification.area || "unknown"}, intent=${lead.qualification.intent}. Channel: ${channel}.`,
    },
  ];

  // Add conversation history
  for (const msg of lead.conversationHistory) {
    messages.push({
      role: msg.role === "agent" ? "assistant" : "user",
      content: msg.content,
    });
  }

  // Add new message
  messages.push({ role: "user", content: newMessage });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: channel === "sms" ? 160 : 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function extractQualification(
  lead: Lead
): Promise<Partial<QualificationData>> {
  const openai = getClient();

  const history = lead.conversationHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Analyze this real estate conversation and extract qualification data. Respond ONLY with valid JSON, no other text.

JSON format:
{
  "type": "buyer" | "seller" | "both" | "unknown",
  "budget": "string or null",
  "propertyType": "string or null",
  "area": "string or null",
  "intent": "hot" | "warm" | "cold" | "unknown",
  "notes": "string or null"
}

Areas to look for: Montreal, Longueuil, South Shore, Brossard, Saint-Lambert, etc.`,
      },
      {
        role: "user",
        content: `Lead: ${lead.firstName} ${lead.lastName}\nMessage: ${lead.message || "none"}\n\nConversation:\n${history}`,
      },
    ],
    max_tokens: 200,
    temperature: 0,
  });

  try {
    const text = response.choices[0]?.message?.content ?? "{}";
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    logger.warn("Failed to parse qualification JSON");
    return {};
  }
}
