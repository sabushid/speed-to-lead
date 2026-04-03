import { google } from "googleapis";
import { getGoogleAuth } from "./google-auth";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import type { Lead, LeadStatus, LeadLanguage, PipelineEvent, QualificationData, ConversationMessage } from "@/lib/types/lead";

const SHEET_NAME = "Leads";
const HEADERS = [
  "ID", "First Name", "Last Name", "Email", "Phone", "Source", "Message",
  "Language", "Status", "Score", "Lead Type", "Budget", "Area", "Intent",
  "Pipeline Events", "Conversation", "Appointment Time", "Calendar Event ID",
  "Follow-Up Count", "Last Contacted", "Created At", "Updated At",
];

function getSheets() {
  return google.sheets({ version: "v4", auth: getGoogleAuth() });
}

export async function initializeSheet(): Promise<void> {
  const sheets = getSheets();
  const sheetId = env.GOOGLE_SHEET_ID();

  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A1:V1`,
    });
    const currentHeaders = existing.data.values?.[0] ?? [];

    // Always update headers if column count doesn't match
    if (currentHeaders.length !== HEADERS.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${SHEET_NAME}!A1:V1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });
      logger.info({ old: currentHeaders.length, new: HEADERS.length }, "Sheet headers updated");
    }
  } catch {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
        },
      });
    } catch { /* sheet may already exist */ }
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A1:V1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function appendLead(lead: Lead): Promise<number> {
  const sheets = getSheets();
  const row = leadToRow(lead);
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SHEET_ID(),
    range: `${SHEET_NAME}!A:V`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
  const updatedRange = response.data.updates?.updatedRange ?? "";
  const rowMatch = updatedRange.match(/(\d+)$/);
  const rowNumber = rowMatch ? parseInt(rowMatch[1], 10) : -1;
  logger.info({ leadId: lead.id, row: rowNumber }, "Lead appended to sheet");
  return rowNumber;
}

export async function getLeads(): Promise<Lead[]> {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEET_ID(),
    range: `${SHEET_NAME}!A2:V`,
  });
  const rows = response.data.values ?? [];
  return rows.map((row, index) => rowToLead(row, index + 2));
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const leads = await getLeads();
  return leads.find((l) => l.id === id) ?? null;
}

export async function updateLead(
  id: string,
  patch: Partial<Pick<Lead, "status" | "pipelineEvents" | "appointmentTime" | "calendarEventId" | "score" | "qualification" | "conversationHistory" | "followUpCount" | "lastContactedAt" | "language">>
): Promise<void> {
  const sheets = getSheets();
  const leads = await getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead || !lead.sheetRow) throw new Error(`Lead not found: ${id}`);

  const updated: Lead = { ...lead, ...patch, updatedAt: new Date().toISOString() };
  const row = leadToRow(updated);
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SHEET_ID(),
    range: `${SHEET_NAME}!A${lead.sheetRow}:V${lead.sheetRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
  logger.info({ leadId: id }, "Lead updated in sheet");
}

function leadToRow(lead: Lead): string[] {
  return [
    lead.id,
    lead.firstName,
    lead.lastName,
    lead.email,
    lead.phone,
    lead.source,
    lead.message ?? "",
    lead.language,
    lead.status,
    String(lead.score),
    lead.qualification.type,
    lead.qualification.budget ?? "",
    lead.qualification.area ?? "",
    lead.qualification.intent,
    JSON.stringify(lead.pipelineEvents),
    JSON.stringify(lead.conversationHistory),
    lead.appointmentTime ?? "",
    lead.calendarEventId ?? "",
    String(lead.followUpCount),
    lead.lastContactedAt ?? "",
    lead.createdAt,
    lead.updatedAt,
  ];
}

function rowToLead(row: string[], sheetRow: number): Lead {
  // Handle both old (13-col) and new (22-col) formats
  const isNewFormat = row.length >= 18;

  if (!isNewFormat) {
    // Old format: ID, First, Last, Email, Phone, Source, Message, Status, Events, Appt, CalID, Created, Updated
    return {
      id: row[0] ?? "",
      firstName: row[1] ?? "",
      lastName: row[2] ?? "",
      email: row[3] ?? "",
      phone: row[4] ?? "",
      source: row[5] ?? "",
      message: row[6] || undefined,
      language: "en",
      status: (row[7] as LeadStatus) ?? "new",
      score: 0,
      qualification: { type: "unknown", intent: "unknown" },
      pipelineEvents: safeParseJson<PipelineEvent[]>(row[8]) ?? [],
      conversationHistory: [],
      appointmentTime: row[9] || undefined,
      calendarEventId: row[10] || undefined,
      followUpCount: 0,
      createdAt: row[11] ?? "",
      updatedAt: row[12] ?? "",
      sheetRow,
    };
  }

  // New format
  return {
    id: row[0] ?? "",
    firstName: row[1] ?? "",
    lastName: row[2] ?? "",
    email: row[3] ?? "",
    phone: row[4] ?? "",
    source: row[5] ?? "",
    message: row[6] || undefined,
    language: (row[7] as LeadLanguage) || "en",
    status: (row[8] as LeadStatus) ?? "new",
    score: parseInt(row[9] ?? "0", 10),
    qualification: {
      type: (row[10] as QualificationData["type"]) || "unknown",
      budget: row[11] || undefined,
      area: row[12] || undefined,
      intent: (row[13] as QualificationData["intent"]) || "unknown",
    },
    pipelineEvents: safeParseJson<PipelineEvent[]>(row[14]) ?? [],
    conversationHistory: safeParseJson<ConversationMessage[]>(row[15]) ?? [],
    appointmentTime: row[16] || undefined,
    calendarEventId: row[17] || undefined,
    followUpCount: parseInt(row[18] ?? "0", 10),
    lastContactedAt: row[19] || undefined,
    createdAt: row[20] ?? "",
    updatedAt: row[21] ?? "",
    sheetRow,
  };
}

function safeParseJson<T>(str: string | undefined): T | null {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}
