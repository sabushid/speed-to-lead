import { google } from "googleapis";
import { getGoogleAuth } from "./google-auth";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import type { Lead, LeadStatus, PipelineEvent } from "@/lib/types/lead";

const SHEET_NAME = "Leads";
const HEADERS = [
  "ID",
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Source",
  "Message",
  "Status",
  "Pipeline Events",
  "Appointment Time",
  "Calendar Event ID",
  "Created At",
  "Updated At",
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
      range: `${SHEET_NAME}!A1:M1`,
    });

    if (!existing.data.values?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${SHEET_NAME}!A1:M1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });
      logger.info("Sheet headers initialized");
    }
  } catch {
    // Sheet might not exist, try creating it
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: SHEET_NAME },
            },
          },
        ],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A1:M1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
    logger.info("Sheet created and headers initialized");
  }
}

export async function appendLead(lead: Lead): Promise<number> {
  const sheets = getSheets();
  const row = leadToRow(lead);

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SHEET_ID(),
    range: `${SHEET_NAME}!A:M`,
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
    range: `${SHEET_NAME}!A2:M`,
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
  patch: Partial<Pick<Lead, "status" | "pipelineEvents" | "appointmentTime" | "calendarEventId">>
): Promise<void> {
  const sheets = getSheets();
  const leads = await getLeads();
  const lead = leads.find((l) => l.id === id);

  if (!lead || !lead.sheetRow) {
    throw new Error(`Lead not found: ${id}`);
  }

  const updated: Lead = {
    ...lead,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const row = leadToRow(updated);
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SHEET_ID(),
    range: `${SHEET_NAME}!A${lead.sheetRow}:M${lead.sheetRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  logger.info({ leadId: id, patch }, "Lead updated in sheet");
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
    lead.status,
    JSON.stringify(lead.pipelineEvents),
    lead.appointmentTime ?? "",
    lead.calendarEventId ?? "",
    lead.createdAt,
    lead.updatedAt,
  ];
}

function rowToLead(row: string[], sheetRow: number): Lead {
  return {
    id: row[0] ?? "",
    firstName: row[1] ?? "",
    lastName: row[2] ?? "",
    email: row[3] ?? "",
    phone: row[4] ?? "",
    source: row[5] ?? "",
    message: row[6] || undefined,
    status: (row[7] as LeadStatus) ?? "new",
    pipelineEvents: safeParseJson(row[8]) ?? [],
    appointmentTime: row[9] || undefined,
    calendarEventId: row[10] || undefined,
    createdAt: row[11] ?? "",
    updatedAt: row[12] ?? "",
    sheetRow,
  };
}

function safeParseJson(str: string | undefined): PipelineEvent[] | null {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
