export type LeadStatus =
  | "new"
  | "contacted_sms"
  | "contacted_voice"
  | "contacted_email"
  | "qualified"
  | "appointment_scheduled"
  | "appointment_completed"
  | "converted"
  | "follow_up"
  | "lost";

export type LeadIntent = "hot" | "warm" | "cold" | "unknown";
export type LeadType = "buyer" | "seller" | "both" | "unknown";
export type LeadLanguage = "en" | "fr";

export interface QualificationData {
  type: LeadType;
  budget?: string;
  propertyType?: string;
  area?: string;
  intent: LeadIntent;
  notes?: string;
}

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
  language: LeadLanguage;
  status: LeadStatus;
  score: number;
  qualification: QualificationData;
  pipelineEvents: PipelineEvent[];
  conversationHistory: ConversationMessage[];
  appointmentTime?: string;
  calendarEventId?: string;
  followUpCount: number;
  lastContactedAt?: string;
  sheetRow?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  role: "agent" | "lead";
  channel: "sms" | "voice" | "email";
  content: string;
  timestamp: string;
}

export type CreateLeadInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source?: string;
  message?: string;
  language?: LeadLanguage;
};
