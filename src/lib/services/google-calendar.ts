import { google } from "googleapis";
import { getGoogleAuth } from "./google-auth";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/utils/logger";
import { addMinutes } from "@/lib/utils/dates";
import type { Lead } from "@/lib/types/lead";
import type { TimeSlot, BookingResult } from "@/lib/types/services";

export async function getAvailableSlots(
  startDate: string,
  endDate: string
): Promise<TimeSlot[]> {
  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = env.GOOGLE_CALENDAR_ID();

  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate,
      timeMax: endDate,
      items: [{ id: calendarId }],
    },
  });

  const busySlots =
    freeBusy.data.calendars?.[calendarId]?.busy ?? [];

  // Generate 30-minute slots during business hours (9am-5pm)
  const slots: TimeSlot[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    for (let hour = 9; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(d);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = addMinutes(slotStart, 30);

        if (slotStart < start || slotEnd > end) continue;

        const isBusy = busySlots.some((busy) => {
          const busyStart = new Date(busy.start!);
          const busyEnd = new Date(busy.end!);
          return slotStart < busyEnd && slotEnd > busyStart;
        });

        if (!isBusy) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
      }
    }
  }

  return slots;
}

export async function bookAppointment(
  lead: Lead,
  slot: TimeSlot
): Promise<BookingResult> {
  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: "v3", auth });

  logger.info(
    { leadId: lead.id, slot },
    "Booking appointment"
  );

  const event = await calendar.events.insert({
    calendarId: env.GOOGLE_CALENDAR_ID(),
    requestBody: {
      summary: `Appointment: ${lead.firstName} ${lead.lastName}`,
      description: [
        `Lead ID: ${lead.id}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone}`,
        `Source: ${lead.source}`,
        lead.message ? `Message: ${lead.message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      start: { dateTime: slot.start },
      end: { dateTime: slot.end },
      attendees: [{ email: lead.email }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 15 },
        ],
      },
    },
  });

  const result: BookingResult = {
    eventId: event.data.id!,
    htmlLink: event.data.htmlLink!,
    start: slot.start,
    end: slot.end,
  };

  logger.info({ eventId: result.eventId }, "Appointment booked");
  return result;
}
