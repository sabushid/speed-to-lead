"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Loader2 } from "lucide-react";
import type { TimeSlot } from "@/lib/types/services";

export default function BookingPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState<{ start: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookingUp(true);
    setError(null);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      const lead = data.leads?.find(
        (l: { email: string }) => l.email.toLowerCase() === email.toLowerCase()
      );
      if (lead) {
        setLeadId(lead.id);
      } else {
        setError("We couldn't find your info. Please use the email you submitted.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLookingUp(false);
    }
  };

  useEffect(() => {
    if (!leadId) return;
    fetch("/api/calendar/availability")
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setError("Failed to load available times"))
      .finally(() => setLoading(false));
  }, [leadId]);

  const handleBook = async (slot: TimeSlot) => {
    setBooking(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, slotStart: slot.start, slotEnd: slot.end }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Booking failed");
      }
      setBooked(slot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  // Booked confirmation
  if (booked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(170deg, #5400b1 0%, #3a0080 100%)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[24px] p-10 text-center"
          style={{ boxShadow: "0 32px 80px rgba(84,0,177,0.25)" }}
        >
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-text-primary mb-4">
            Appointment Confirmed!
          </h1>
          <div className="bg-brand-offwhite rounded-2xl p-5 mb-4">
            <div className="text-lg font-bold text-brand-dark font-[family-name:var(--font-heading)]">
              {formatDateTime(booked.start)}
            </div>
            <div className="text-sm text-text-muted mt-1">30 minutes</div>
          </div>
          <p className="text-sm text-text-muted">
            A confirmation has been sent to your email and phone.
          </p>
        </motion.div>
      </div>
    );
  }

  // Email lookup
  if (!leadId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(170deg, #5400b1 0%, #3a0080 100%)" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[24px] p-10"
          style={{ boxShadow: "0 32px 80px rgba(84,0,177,0.25)" }}
        >
          <div className="text-center mb-6">
            <Calendar className="w-12 h-12 text-brand-dark mx-auto mb-4" />
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-text-primary mb-2">
              Book Your Appointment
            </h1>
            <p className="text-text-muted text-sm">Enter the email you used to get started</p>
          </div>
          <form onSubmit={handleLookup} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200"
              style={{ boxShadow: "none" }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(128,77,211,0.15)"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            />
            {error && <div className="text-sm text-red-500">{error}</div>}
            <button
              type="submit"
              disabled={lookingUp}
              className="w-full rounded-full px-6 py-4 text-white font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #5400b1, #804dd3)", boxShadow: "0 4px 20px rgba(84,0,177,0.4)", minHeight: "52px" }}
            >
              {lookingUp ? <><Loader2 className="w-5 h-5 animate-spin" /> Looking up...</> : "Continue"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Pick a slot
  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "linear-gradient(170deg, #f7f5fc 0%, #e5ebf8 100%)" }}>
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-text-primary mb-2">
            Pick a Time
          </h1>
          <p className="text-text-muted">Choose a 30-minute slot that works for you</p>
        </motion.div>

        {loading && (
          <div className="text-center py-12 text-text-muted flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading available times...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">{error}</div>
        )}

        {!loading && slots.length === 0 && (
          <div className="bg-white rounded-[20px] border border-brand-dark/6 p-8 text-center text-text-muted" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
            No available slots this week. Please check back later.
          </div>
        )}

        {!loading && slots.length > 0 && (
          <div className="space-y-4">
            {groupByDay(slots).map(([day, daySlots]) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[20px] border border-brand-dark/6 p-5"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
              >
                <h3 className="text-sm font-bold text-text-primary font-[family-name:var(--font-heading)] mb-3">{day}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => handleBook(slot)}
                      disabled={booking}
                      className="px-3 py-2.5 text-sm font-semibold rounded-xl border border-brand-dark/10 text-brand-dark hover:bg-brand-dark hover:text-white hover:border-brand-dark disabled:opacity-50 transition-all duration-200"
                    >
                      {formatTime(slot.start)}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

function groupByDay(slots: TimeSlot[]): [string, TimeSlot[]][] {
  const groups: Record<string, TimeSlot[]> = {};
  for (const slot of slots) {
    const day = new Date(slot.start).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!groups[day]) groups[day] = [];
    groups[day].push(slot);
  }
  return Object.entries(groups);
}
