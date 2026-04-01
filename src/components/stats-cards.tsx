"use client";

import type { Lead } from "@/lib/types/lead";

interface StatsCardsProps {
  leads: Lead[];
}

export default function StatsCards({ leads }: StatsCardsProps) {
  const total = leads.length;
  const contacted = leads.filter((l) =>
    ["contacted_sms", "contacted_voice", "contacted_email"].includes(l.status)
  ).length;
  const scheduled = leads.filter(
    (l) => l.status === "appointment_scheduled"
  ).length;
  const converted = leads.filter((l) => l.status === "converted").length;

  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  const stats = [
    { label: "Total Leads", value: total, color: "bg-blue-50 text-blue-700" },
    { label: "Contacted", value: contacted, color: "bg-yellow-50 text-yellow-700" },
    { label: "Appointments", value: scheduled, color: "bg-green-50 text-green-700" },
    { label: "Conversion", value: `${conversionRate}%`, color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl p-5 ${stat.color} border border-gray-100`}
        >
          <div className="text-sm font-medium opacity-80">{stat.label}</div>
          <div className="text-3xl font-bold mt-1">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
