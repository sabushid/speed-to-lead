"use client";

import { useState, type FormEvent } from "react";

export default function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value || undefined,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-green-800 mb-2">
          We got your info!
        </h3>
        <p className="text-green-700 text-sm leading-relaxed">
          Expect a text from us in the next few seconds. We&apos;re fast like that.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-1.5">
            First Name
          </label>
          <input
            name="firstName"
            id="firstName"
            type="text"
            required
            minLength={1}
            maxLength={100}
            className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(128,77,211,0.15)]"
            placeholder="Jane"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-1.5">
            Last Name
          </label>
          <input
            name="lastName"
            id="lastName"
            type="text"
            required
            minLength={1}
            maxLength={100}
            className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(128,77,211,0.15)]"
            placeholder="Smith"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
          Email
        </label>
        <input
          name="email"
          id="email"
          type="email"
          required
          className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(128,77,211,0.15)]"
          placeholder="jane@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1.5">
          Phone Number
        </label>
        <input
          name="phone"
          id="phone"
          type="tel"
          required
          pattern="\+?[1-9]\d{9,14}"
          title="Enter a valid phone number (e.g. +15551234567)"
          className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(128,77,211,0.15)]"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1.5">
          Message <span className="text-text-muted/60">(optional)</span>
        </label>
        <textarea
          name="message"
          id="message"
          rows={3}
          maxLength={1000}
          className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200 resize-none focus:shadow-[0_0_0_3px_rgba(128,77,211,0.15)]"
          placeholder="Tell us what you're looking for..."
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full px-6 py-4 text-white font-bold text-base transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #5400b1, #804dd3)",
          boxShadow: "0 4px 20px rgba(84,0,177,0.4)",
          minHeight: "52px",
        }}
      >
        {submitting ? "Submitting..." : "Get Started Now"}
      </button>

      <p className="text-xs text-text-muted text-center">
        We&apos;ll reach out within seconds. No spam, ever.
      </p>
    </form>
  );
}
