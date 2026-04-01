"use client";

import type { PipelineEvent } from "@/lib/types/lead";

interface PipelineStatusProps {
  events: PipelineEvent[];
}

const STATUS_STYLES = {
  pending: "bg-gray-200 text-gray-600",
  running: "bg-yellow-200 text-yellow-800",
  success: "bg-green-200 text-green-800",
  failed: "bg-red-200 text-red-800",
};

const STEP_LABELS: Record<string, string> = {
  sms_response: "SMS Sent",
  voice_call: "Voice Call",
  email_followup: "Email Follow-up",
  crm_update: "CRM Updated",
  appointment_booked: "Appointment Booked",
  inbound_sms: "Lead Replied",
  crm_final_update: "Pipeline Complete",
};

export default function PipelineStatus({ events }: PipelineStatusProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">No pipeline events yet</div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full mt-1 ${
                event.status === "success"
                  ? "bg-green-500"
                  : event.status === "failed"
                  ? "bg-red-500"
                  : event.status === "running"
                  ? "bg-yellow-500"
                  : "bg-gray-300"
              }`}
            />
            {i < events.length - 1 && (
              <div className="w-0.5 h-6 bg-gray-200 mt-1" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {STEP_LABELS[event.step] ?? event.step}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[event.status]}`}
              >
                {event.status}
              </span>
            </div>
            {event.detail && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{event.detail}</p>
            )}
            {event.error && (
              <p className="text-xs text-red-500 mt-0.5">{event.error}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
