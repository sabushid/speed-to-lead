import { NextRequest, NextResponse } from "next/server";
import { getLeadById } from "@/lib/services/google-sheets";
import { generateVoiceTwiml } from "@/lib/voice/agent";
import { processVoiceTurn } from "@/lib/voice/agent";
import { t } from "@/lib/i18n/translations";
import { logger } from "@/lib/utils/logger";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const turn = parseInt(searchParams.get("turn") ?? "0", 10);

    if (!leadId) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, something went wrong.</Say></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    const lead = await getLeadById(leadId);
    if (!lead) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, we could not find your information.</Say></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Turn 0: initial greeting (call just connected)
    if (turn === 0) {
      const lang = lead.language;
      const greeting = t(lang).voice.greeting(lead.firstName);
      const gatherUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voice?leadId=${leadId}&turn=1`;
      const twiml = generateVoiceTwiml(greeting, gatherUrl, lang);
      return new NextResponse(twiml, {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Turn 1+: process speech and respond
    const formData = await request.formData();
    const speechResult = (formData.get("SpeechResult") as string) ?? "";

    if (!speechResult) {
      // No speech detected — end call gracefully
      const lang = lead.language;
      const voice = lang === "fr" ? "Polly.Lea" : "Polly.Joanna";
      const language = lang === "fr" ? "fr-CA" : "en-US";
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${language}">${t(lang).voice.noAnswer}</Say>
</Response>`;
      return new NextResponse(twiml, {
        headers: { "Content-Type": "text/xml" },
      });
    }

    logger.info({ leadId, turn, speech: speechResult }, "Voice turn processing");

    const { twiml } = await processVoiceTurn(lead, speechResult, turn);

    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    logger.error({ error: String(error) }, "Voice webhook error");
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, something went wrong. We will follow up by text.</Say></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
