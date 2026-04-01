import { logger } from "@/lib/utils/logger";
import { sleep, nowISO } from "@/lib/utils/dates";
import { updateLead } from "@/lib/services/google-sheets";
import { withRetry } from "./retry";
import {
  sendInitialSms,
  initiateVoiceCall,
  sendFollowUpEmail,
  updateCrmRecord,
} from "./steps";
import type { Lead, PipelineEvent } from "@/lib/types/lead";
import type { PipelineStep, PipelineResult, StepResult } from "@/lib/types/pipeline";

const PIPELINE_STEPS: PipelineStep[] = [
  { name: "sms_response", execute: sendInitialSms },
  { name: "voice_call", execute: initiateVoiceCall },
  { name: "email_followup", execute: sendFollowUpEmail },
  { name: "crm_update", execute: updateCrmRecord },
];

export async function runPipeline(lead: Lead): Promise<PipelineResult> {
  const pipelineStart = Date.now();
  const log = logger.child({ leadId: lead.id, pipeline: true });

  log.info("Pipeline started");

  const stepResults: PipelineResult["steps"] = [];

  for (const step of PIPELINE_STEPS) {
    // Apply delay if specified
    if (step.delayMs) {
      log.info({ step: step.name, delayMs: step.delayMs }, "Waiting before step");
      await sleep(step.delayMs);
    }

    const stepStart = Date.now();

    // Record step as running
    const runningEvent: PipelineEvent = {
      step: step.name,
      status: "running",
      timestamp: nowISO(),
    };
    await safeUpdateEvents(lead.id, lead, runningEvent);

    let result: StepResult;
    try {
      result = await withRetry(() => step.execute(lead), {
        stepName: step.name,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      result = { success: false, error: errorMsg };
      log.error({ step: step.name, error: errorMsg }, "Step failed permanently");
    }

    const durationMs = Date.now() - stepStart;

    // Record step result
    const completedEvent: PipelineEvent = {
      step: step.name,
      status: result.success ? "success" : "failed",
      timestamp: nowISO(),
      detail: result.detail,
      error: result.error,
    };
    await safeUpdateEvents(lead.id, lead, completedEvent);

    stepResults.push({ name: step.name, result, durationMs });

    log.info(
      { step: step.name, success: result.success, durationMs },
      `Step completed: ${step.name}`
    );
  }

  const totalDurationMs = Date.now() - pipelineStart;
  log.info({ totalDurationMs, steps: stepResults.length }, "Pipeline completed");

  return {
    leadId: lead.id,
    steps: stepResults,
    totalDurationMs,
  };
}

async function safeUpdateEvents(
  leadId: string,
  lead: Lead,
  event: PipelineEvent
) {
  try {
    const events = [...(lead.pipelineEvents ?? []), event];
    lead.pipelineEvents = events;
    await updateLead(leadId, { pipelineEvents: events });
  } catch (error) {
    logger.warn(
      { leadId, error: String(error) },
      "Failed to update pipeline events"
    );
  }
}
