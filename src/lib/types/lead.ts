export type LeadStatus =
  | "new"
  | "contacted_sms"
  | "contacted_voice"
  | "contacted_email"
  | "appointment_scheduled"
  | "appointment_completed"
  | "converted"
  | "lost";

export interface PipelineEvent {
  step: string;
  status: "pending" | "running" | "success" | "failed";
  timestamp: string;
  detail?: string;
  error?: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  message?: string;
  status: LeadStatus;
  pipelineEvents: PipelineEvent[];
  appointmentTime?: string;
  calendarEventId?: string;
  sheetRow?: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateLeadInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source?: string;
  message?: string;
};
