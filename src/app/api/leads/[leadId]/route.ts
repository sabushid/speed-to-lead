import { NextRequest, NextResponse } from "next/server";
import { getLeadById, updateLead } from "@/lib/services/google-sheets";
import { logger } from "@/lib/utils/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  try {
    const lead = await getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    logger.error({ leadId, error: String(error) }, "Failed to fetch lead");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  try {
    const body = await request.json();
    await updateLead(leadId, body);
    const updated = await getLeadById(leadId);
    return NextResponse.json(updated);
  } catch (error) {
    logger.error({ leadId, error: String(error) }, "Failed to update lead");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
