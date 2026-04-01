export interface TimeSlot {
  start: string;
  end: string;
}

export interface SmsResult {
  sid: string;
  status: string;
}

export interface CallResult {
  sid: string;
  status: string;
}

export interface EmailResult {
  messageId: string;
}

export interface BookingResult {
  eventId: string;
  htmlLink: string;
  start: string;
  end: string;
}
