import { NextRequest, NextResponse } from "next/server";
import { processFollowUps } from "@/lib/followup/sequences";
import { logger } from "@/lib/utils/logger";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Protect with a secret
    const authHeader = request.headers.get("authorization");
    const expected = process.env.WEBHOOK_SECRET;
    if (expected && authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const processed = await processFollowUps();
    logger.info({ processed }, "Follow-ups processed");

    return NextResponse.json({ processed });
  } catch (error) {
    logger.error({ error: String(error) }, "Follow-up processing failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
