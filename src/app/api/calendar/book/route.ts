import { NextRequest, NextResponse } from "next/server";
import { getLeadById, updateLead } from "@/lib/services/google-sheets";
import { bookAppointment } from "@/lib/services/google-calendar";
import { sendSms } from "@/lib/services/twilio";
import { sendEmail } from "@/lib/services/gmail";
import { formatE164 } from "@/lib/utils/phone";
import { formatSlot } from "@/lib/utils/dates";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const { leadId, slotStart, slotEnd } = await request.json();

    if (!leadId || !slotStart || !slotEnd) {
      return NextResponse.json(
        { error: "leadId, slotStart, and slotEnd are required" },
        { status: 400 }
      );
    }

    const lead = await getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const booking = await bookAppointment(lead, {
      start: slotStart,
      end: slotEnd,
    });

    await updateLead(lead.id, {
      status: "appointment_scheduled",
      appointmentTime: slotStart,
      calendarEventId: booking.eventId,
      pipelineEvents: [
        ...(lead.pipelineEvents ?? []),
        {
          step: "appointment_booked",
          status: "success",
          timestamp: new Date().toISOString(),
          detail: `Booked: ${formatSlot(slotStart)}`,
        },
      ],
    });

    // Send confirmations
    const confirmMsg = `Your appointment is confirmed for ${formatSlot(slotStart)}. See you then!`;

    await Promise.all([
      sendSms(formatE164(lead.phone), confirmMsg),
      sendEmail(
        lead.email,
        "Appointment Confirmed",
        `<p>Hi ${lead.firstName},</p>
         <p>${confirmMsg}</p>
         <p><a href="${booking.htmlLink}">Add to your calendar</a></p>`
      ),
    ]);

    logger.info({ leadId, eventId: booking.eventId }, "Appointment booked via API");

    return NextResponse.json({
      success: true,
      eventId: booking.eventId,
      appointment: { start: slotStart, end: slotEnd },
    });
  } catch (error) {
    logger.error({ error: String(error) }, "Booking failed");
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
