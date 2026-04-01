"use client";

import { useEffect, useState } from "react";
import type { TimeSlot } from "@/lib/types/services";

export default function BookingPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState<{ start: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: identify the lead
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
        body: JSON.stringify({
          leadId,
          slotStart: slot.start,
          slotEnd: slot.end,
        }),
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
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h1>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-lg font-semibold text-blue-700">
              {formatDateTime(booked.start)}
            </div>
            <div className="text-sm text-blue-500">30 minutes</div>
          </div>
          <p className="text-sm text-gray-500">
            A confirmation has been sent to your email and phone.
          </p>
        </div>
      </div>
    );
  }

  // Step 1: Email lookup
  if (!leadId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Book Your Appointment</h1>
          <p className="text-gray-500 text-center mb-6">Enter the email you used to get started</p>
          <form onSubmit={handleLookup} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            <button
              type="submit"
              disabled={lookingUp}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {lookingUp ? "Looking up..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Pick a slot
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pick a Time</h1>
          <p className="text-gray-500">Choose a 30-minute slot that works for you</p>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-500">Loading available times...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">{error}</div>
        )}

        {!loading && slots.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No available slots this week. Please check back later.
          </div>
        )}

        {!loading && slots.length > 0 && (
          <div className="space-y-3">
            {groupByDay(slots).map(([day, daySlots]) => (
              <div key={day} className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{day}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => handleBook(slot)}
                      disabled={booking}
                      className="px-3 py-2 text-sm font-medium rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition"
                    >
                      {formatTime(slot.start)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function groupByDay(slots: TimeSlot[]): [string, TimeSlot[]][] {
  const groups: Record<string, TimeSlot[]> = {};
  for (const slot of slots) {
    const day = new Date(slot.start).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!groups[day]) groups[day] = [];
    groups[day].push(slot);
  }
  return Object.entries(groups);
}
