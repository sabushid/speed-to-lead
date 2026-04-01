"use client";

import { useState } from "react";
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
      {/* Lead Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">ID: {lead.id}</p>
          </div>
          <button
            onClick={handleRetrigger}
            disabled={retriggering}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {retriggering ? "Triggering..." : "Re-run Pipeline"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoField label="Email" value={lead.email} />
          <InfoField label="Phone" value={lead.phone} />
          <InfoField label="Source" value={lead.source} />
          <InfoField label="Status" value={lead.status} />
          <InfoField
            label="Created"
            value={new Date(lead.createdAt).toLocaleString()}
          />
          <InfoField
            label="Appointment"
            value={
              lead.appointmentTime
                ? new Date(lead.appointmentTime).toLocaleString()
                : "Not scheduled"
            }
          />
        </div>

        {lead.message && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-500 mb-1">Message</div>
            <p className="text-sm text-gray-700">{lead.message}</p>
          </div>
        )}
      </div>

      {/* Pipeline Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pipeline Activity
        </h3>
        <PipelineStatus events={lead.pipelineEvents} />
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-sm text-gray-900 mt-0.5">{value}</div>
    </div>
  );
}
