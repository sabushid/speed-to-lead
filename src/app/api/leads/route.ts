import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createLeadSchema } from "@/lib/validators/lead";
import { appendLead, getLeads, initializeSheet } from "@/lib/services/google-sheets";
import { runPipeline } from "@/lib/pipeline/orchestrator";
import { logger } from "@/lib/utils/logger";
import type { Lead } from "@/lib/types/lead";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();

    const lead: Lead = {
      id: uuid(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      source: data.source ?? "landing_page",
      message: data.message,
      status: "new",
      pipelineEvents: [],
      createdAt: now,
      updatedAt: now,
    };

    // Initialize sheet headers if needed, then append lead
    await initializeSheet();
    const rowNumber = await appendLead(lead);
    lead.sheetRow = rowNumber;

    logger.info({ leadId: lead.id }, "New lead created");

    // Run pipeline in background (fire-and-forget)
    runPipeline(lead).catch((error) => {
      logger.error({ leadId: lead.id, error: String(error) }, "Pipeline failed");
    });

    return NextResponse.json(
      { id: lead.id, status: "new", message: "Lead received — pipeline started" },
      { status: 201 }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error("Lead creation error:", errMsg, errStack);
    return NextResponse.json(
      { error: "Internal server error", detail: errMsg },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({ leads, total: leads.length });
  } catch (error) {
    logger.error({ error: String(error) }, "Failed to fetch leads");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
