import { NextRequest, NextResponse } from "next/server";
import { getLeadById, updateLead } from "@/lib/services/google-sheets";
import { bookAppointment } from "@/lib/services/google-calendar";
import { sendSms } from "@/lib/services/twilio";
import { sendEmail } from "@/lib/services/gmail";
import { formatE164 } from "@/lib/utils/phone";
import { formatSlot } from "@/lib/utils/dates";
import { logger } from "@/lib/utils/logger";
import type { TimeSlot } from "@/lib/types/services";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, room, leadId, appointmentSlot } = body;

    logger.info({ event, room }, "LiveKit webhook received");

    // Handle appointment booking from voice agent
    if (event === "appointment_requested" && leadId && appointmentSlot) {
      const lead = await getLeadById(leadId);
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }

      const slot: TimeSlot = appointmentSlot;
      const booking = await bookAppointment(lead, slot);

      await updateLead(lead.id, {
        status: "appointment_scheduled",
        appointmentTime: slot.start,
        calendarEventId: booking.eventId,
        pipelineEvents: [
          ...(lead.pipelineEvents ?? []),
          {
            step: "appointment_booked",
            status: "success",
            timestamp: new Date().toISOString(),
            detail: `Booked for ${formatSlot(slot.start)}`,
          },
        ],
      });

      // Send confirmation SMS and email
      const phone = formatE164(lead.phone);
      const confirmMsg = `Your appointment is confirmed for ${formatSlot(slot.start)}. We look forward to speaking with you!`;

      await Promise.all([
        sendSms(phone, confirmMsg),
        sendEmail(
          lead.email,
          "Appointment Confirmed",
          `<p>Hi ${lead.firstName},</p>
           <p>${confirmMsg}</p>
           <p><a href="${booking.htmlLink}">Add to your calendar</a></p>`
        ),
      ]);

      return NextResponse.json({ success: true, eventId: booking.eventId });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ error: String(error) }, "LiveKit webhook error");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
