"use client";

import { CheckCircle, XCircle, Loader2, Circle } from "lucide-react";
import type { PipelineEvent } from "@/lib/types/lead";

interface PipelineStatusProps {
  events: PipelineEvent[];
}

const STEP_LABELS: Record<string, string> = {
  sms_response: "SMS Sent",
  voice_call: "Voice Call",
  email_followup: "Email Follow-up",
  crm_update: "CRM Updated",
  appointment_booked: "Appointment Booked",
  inbound_sms: "Lead Replied",
  crm_final_update: "Pipeline Complete",
};

const STATUS_ICON = {
  pending: Circle,
  running: Loader2,
  success: CheckCircle,
  failed: XCircle,
};

const STATUS_COLOR = {
  pending: "text-gray-300",
  running: "text-brand-medium animate-spin",
  success: "text-green-500",
  failed: "text-red-500",
};

export default function PipelineStatus({ events }: PipelineStatusProps) {
  if (!events || events.length === 0) {
    return <div className="text-sm text-text-muted italic">No pipeline events yet</div>;
  }

  return (
    <div className="space-y-1">
      {events.map((event, i) => {
        const Icon = STATUS_ICON[event.status];
        return (
          <div key={i} className="flex items-start gap-3 py-2">
            <div className="flex flex-col items-center pt-0.5">
              <Icon className={`w-5 h-5 ${STATUS_COLOR[event.status]}`} />
              {i < events.length - 1 && <div className="w-0.5 h-6 bg-brand-dark/6 mt-1" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {STEP_LABELS[event.step] ?? event.step}
                </span>
              </div>
              {event.detail && <p className="text-xs text-text-muted mt-0.5 truncate">{event.detail}</p>}
              {event.error && <p className="text-xs text-red-500 mt-0.5">{event.error}</p>}
              <p className="text-xs text-text-muted/60 mt-0.5">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
