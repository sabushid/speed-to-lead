"use client";

import { use } from "react";
import Link from "next/link";
import { useLead } from "@/hooks/use-leads";
import LeadDetail from "@/components/lead-detail";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = use(params);
  const { lead, isLoading, error, refresh } = useLead(leadId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading lead...</div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          &larr; Back to dashboard
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          Lead not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-block text-sm text-blue-600 hover:text-blue-700"
      >
        &larr; Back to dashboard
      </Link>
      <LeadDetail lead={lead} onRefresh={refresh} />
    </div>
  );
}
