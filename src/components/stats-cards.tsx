"use client";

import { Users, PhoneCall, CalendarCheck, TrendingUp } from "lucide-react";
import type { Lead } from "@/lib/types/lead";

interface StatsCardsProps {
  leads: Lead[];
}

export default function StatsCards({ leads }: StatsCardsProps) {
  const total = leads.length;
  const contacted = leads.filter((l) =>
    ["contacted_sms", "contacted_voice", "contacted_email"].includes(l.status)
  ).length;
  const scheduled = leads.filter((l) => l.status === "appointment_scheduled").length;
  const converted = leads.filter((l) => l.status === "converted").length;
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  const stats = [
    { label: "Total Leads", value: total, icon: Users, color: "text-brand-dark", bg: "bg-brand-dark/6" },
    { label: "Contacted", value: contacted, icon: PhoneCall, color: "text-brand-medium", bg: "bg-brand-medium/10" },
    { label: "Appointments", value: scheduled, icon: CalendarCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-brand-dark", bg: "bg-brand-light/20" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-[20px] p-6 border border-brand-dark/6 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="text-sm text-text-muted mb-1">{stat.label}</div>
          <div className="text-3xl font-extrabold text-text-primary font-[family-name:var(--font-heading)]">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
