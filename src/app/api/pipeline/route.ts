import { NextRequest, NextResponse } from "next/server";
import { getLeadById } from "@/lib/services/google-sheets";
import { runPipeline } from "@/lib/pipeline/orchestrator";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId is required" },
        { status: 400 }
      );
    }

    const lead = await getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    logger.info({ leadId }, "Manual pipeline trigger");

    // Run in background
    runPipeline(lead).catch((error) => {
      logger.error({ leadId, error: String(error) }, "Pipeline failed");
    });

    return NextResponse.json({
      message: "Pipeline triggered",
      leadId,
    });
  } catch (error) {
    logger.error({ error: String(error) }, "Pipeline trigger failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
