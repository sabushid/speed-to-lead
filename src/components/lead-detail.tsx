"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { Lead } from "@/lib/types/lead";
import PipelineStatus from "./pipeline-status";

interface LeadDetailProps {
  lead: Lead;
  onRefresh: () => void;
}

export default function LeadDetail({ lead, onRefresh }: LeadDetailProps) {
  const [retriggering, setRetriggering] = useState(false);

  const handleRetrigger = async () => {
    setRetriggering(true);
    try {
      await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      onRefresh();
    } finally {
      setRetriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] border border-brand-dark/6 p-8" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-text-primary">
              {lead.firstName} {lead.lastName}
            </h2>
            <p className="text-sm text-text-muted mt-1">ID: {lead.id}</p>
          </div>
          <button
            onClick={handleRetrigger}
            disabled={retriggering}
            className="px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #5400b1, #804dd3)", boxShadow: "0 4px 20px rgba(84,0,177,0.3)" }}
          >
            <RefreshCw className={`w-4 h-4 ${retriggering ? "animate-spin" : ""}`} />
            {retriggering ? "Running..." : "Re-run Pipeline"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: "Email", value: lead.email },
            { label: "Phone", value: lead.phone },
            { label: "Source", value: lead.source },
            { label: "Status", value: lead.status },
            { label: "Created", value: new Date(lead.createdAt).toLocaleString() },
            { label: "Appointment", value: lead.appointmentTime ? new Date(lead.appointmentTime).toLocaleString() : "Not scheduled" },
          ].map((field) => (
            <div key={field.label}>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider font-[family-name:var(--font-heading)] mb-1">
                {field.label}
              </div>
              <div className="text-sm text-text-primary">{field.value}</div>
            </div>
          ))}
        </div>

        {lead.message && (
          <div className="mt-6 p-4 bg-brand-offwhite rounded-2xl">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider font-[family-name:var(--font-heading)] mb-1">Message</div>
            <p className="text-sm text-text-primary">{lead.message}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[20px] border border-brand-dark/6 p-8" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-text-primary mb-5">
          Pipeline Activity
        </h3>
        <PipelineStatus events={lead.pipelineEvents} />
      </div>
    </div>
  );
}
