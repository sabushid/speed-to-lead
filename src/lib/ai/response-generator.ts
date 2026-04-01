import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import { getSystemPrompt, buildUserPrompt } from "./prompts";
import type { Lead } from "@/lib/types/lead";

let client: Anthropic | null = null;

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY() });
  }
  return client;
}

export async function generateResponse(
  lead: Lead,
  stage: string
): Promise<string> {
  const anthropic = getClient();

  logger.info({ leadId: lead.id, stage }, "Generating AI response");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: getSystemPrompt(stage),
    messages: [
      {
        role: "user",
        content: buildUserPrompt(lead, stage),
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  logger.info(
    { leadId: lead.id, stage, responseLength: text.length },
    "AI response generated"
  );

  return text;
}
