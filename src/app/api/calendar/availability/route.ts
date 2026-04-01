import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/services/google-calendar";
import { logger } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      // Default to next 7 days
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const slots = await getAvailableSlots(
        now.toISOString(),
        weekFromNow.toISOString()
      );
      return NextResponse.json({ slots });
    }

    const slots = await getAvailableSlots(start, end);
    return NextResponse.json({ slots });
  } catch (error) {
    logger.error({ error: String(error) }, "Failed to fetch availability");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
