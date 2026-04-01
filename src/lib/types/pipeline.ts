import type { Lead } from "./lead";

export interface StepResult {
  success: boolean;
  detail?: string;
  error?: string;
}

export interface PipelineStep {
  name: string;
  execute: (lead: Lead) => Promise<StepResult>;
  delayMs?: number;
}

export interface PipelineResult {
  leadId: string;
  steps: Array<{
    name: string;
    result: StepResult;
    durationMs: number;
  }>;
  totalDurationMs: number;
}
