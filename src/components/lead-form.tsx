"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadSchema, type CreateLeadFormData } from "@/lib/validators/lead";
import { CheckCircle, Loader2 } from "lucide-react";

export default function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<CreateLeadFormData>({ resolver: zodResolver(createLeadSchema) as any });

  const onSubmit = async (data: CreateLeadFormData) => {
    setSubmitting(true);
    setError(null);

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
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-1.5">
            First Name
          </label>
          <input
            {...register("firstName")}
            id="firstName"
            type="text"
            className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200"
            style={{ boxShadow: "none" }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(128,77,211,0.15)"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            placeholder="Jane"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-1.5">
            Last Name
          </label>
          <input
            {...register("lastName")}
            id="lastName"
            type="text"
            className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200"
            style={{ boxShadow: "none" }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(128,77,211,0.15)"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            placeholder="Smith"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
          Email
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200"
          style={{ boxShadow: "none" }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(128,77,211,0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          placeholder="jane@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1.5">
          Phone Number
        </label>
        <input
          {...register("phone")}
          id="phone"
          type="tel"
          className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200"
          style={{ boxShadow: "none" }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(128,77,211,0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1.5">
          Message <span className="text-text-muted/60">(optional)</span>
        </label>
        <textarea
          {...register("message")}
          id="message"
          rows={3}
          className="w-full rounded-xl border border-brand-dark/10 bg-brand-offwhite px-4 py-3.5 text-text-primary placeholder-text-muted/50 focus:border-brand-medium focus:bg-white outline-none transition-all duration-200 resize-none"
          style={{ boxShadow: "none" }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(128,77,211,0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
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
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Get Started Now"
        )}
      </button>

      <p className="text-xs text-text-muted text-center">
        We&apos;ll reach out within seconds. No spam, ever.
      </p>
    </form>
  );
}
