"use client";

import Link from "next/link";
import type { Lead, LeadStatus } from "@/lib/types/lead";

interface LeadTableProps {
  leads: Lead[];
}

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-gray-100 text-gray-700",
  contacted_sms: "bg-blue-100 text-blue-700",
  contacted_voice: "bg-indigo-100 text-indigo-700",
  contacted_email: "bg-purple-100 text-purple-700",
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
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No leads yet. Share your landing page to start capturing leads!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Contact
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Source
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Created
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Appointment
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/${lead.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {lead.firstName} {lead.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-700">{lead.email}</div>
                  <div className="text-xs text-gray-400">{lead.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                      STATUS_BADGE[lead.status]
                    }`}
                  >
                    {STATUS_LABEL[lead.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {lead.source}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {lead.appointmentTime
                    ? new Date(lead.appointmentTime).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
