"use client";

import { useLeads } from "@/hooks/use-leads";
import StatsCards from "@/components/stats-cards";
import LeadTable from "@/components/lead-table";

export default function DashboardPage() {
  const { leads, isLoading, error } = useLeads();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading leads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        Failed to load leads. Make sure your Google Sheets is configured.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lead Dashboard</h1>
        <div className="text-sm text-gray-500">
          Auto-refreshing every 5 seconds
        </div>
      </div>

      <StatsCards leads={leads} />
      <LeadTable leads={leads} />
    </div>
  );
}
