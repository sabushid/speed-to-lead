import type { Lead, LeadIntent } from "@/lib/types/lead";

export interface ScoreBreakdown {
  total: number;
  factors: Record<string, number>;
}

export function scoreLead(lead: Lead): ScoreBreakdown {
  const factors: Record<string, number> = {};

  // Response engagement (did they reply?)
  const smsReplies = lead.conversationHistory.filter(
    (m) => m.role === "lead" && m.channel === "sms"
  ).length;
  if (smsReplies > 0) factors["sms_engaged"] = 15;
  if (smsReplies > 2) factors["sms_active"] = 10;

  // Voice call answered
  const voiceEvents = lead.pipelineEvents.filter(
    (e) => e.step === "voice_call" && e.status === "success"
  );
  if (voiceEvents.length > 0) factors["call_answered"] = 20;

  // Qualification completeness
  const q = lead.qualification;
  if (q.type !== "unknown") factors["type_known"] = 10;
  if (q.budget) factors["budget_known"] = 10;
  if (q.area) factors["area_known"] = 10;

  // Intent level
  const intentScores: Record<LeadIntent, number> = {
    hot: 25,
    warm: 15,
    cold: 5,
    unknown: 0,
  };
  factors["intent"] = intentScores[q.intent];

  // Appointment booked
  if (lead.appointmentTime) factors["appointment_booked"] = 20;

  // Has message (showed effort)
  if (lead.message && lead.message.length > 10) factors["detailed_message"] = 5;

  // Recency penalty
  const hoursSinceCreated =
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreated > 72) factors["stale_penalty"] = -10;

  const total = Math.max(
    0,
    Math.min(100, Object.values(factors).reduce((s, v) => s + v, 0))
  );

  return { total, factors };
}

export function getIntentLabel(score: number): LeadIntent {
  if (score >= 60) return "hot";
  if (score >= 30) return "warm";
  if (score >= 10) return "cold";
  return "unknown";
}
