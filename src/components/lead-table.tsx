"use client";

import Link from "next/link";
import type { Lead, LeadStatus } from "@/lib/types/lead";

interface LeadTableProps {
  leads: Lead[];
}

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-gray-100 text-gray-700",
  contacted_sms: "bg-brand-dark/10 text-brand-dark",
  contacted_voice: "bg-brand-medium/10 text-brand-medium",
  contacted_email: "bg-brand-light/30 text-brand-dark",
  appointment_scheduled: "bg-green-100 text-green-700",
  appointment_completed: "bg-teal-100 text-teal-700",
  converted: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted_sms: "SMS Sent",
  contacted_voice: "Called",
  contacted_email: "Emailed",
  appointment_scheduled: "Appt Scheduled",
  appointment_completed: "Appt Done",
  converted: "Converted",
  lost: "Lost",
};

export default function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-[20px] border border-brand-dark/6 p-12 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
        <p className="text-text-muted">No leads yet. Share your landing page to start capturing leads!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-brand-dark/6 overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-brand-offwhite border-b border-brand-dark/6">
              {["Name", "Contact", "Status", "Source", "Created", "Appointment"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider font-[family-name:var(--font-heading)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/4">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-brand-offwhite/50 transition-colors duration-200">
                <td className="px-5 py-4">
                  <Link href={`/dashboard/${lead.id}`} className="text-sm font-semibold text-brand-dark hover:text-brand-medium transition-colors">
                    {lead.firstName} {lead.lastName}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm text-text-primary">{lead.email}</div>
                  <div className="text-xs text-text-muted">{lead.phone}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE[lead.status]}`}>
                    {STATUS_LABEL[lead.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-text-muted">{lead.source}</td>
                <td className="px-5 py-4 text-sm text-text-muted">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-sm text-text-muted">
                  {lead.appointmentTime ? new Date(lead.appointmentTime).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
