"use client";

import { motion } from "framer-motion";
import { CheckCircle, MessageSquare, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(170deg, #5400b1 0%, #3a0080 100%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-[24px] p-10 text-center"
        style={{ boxShadow: "0 32px 80px rgba(84,0,177,0.25)" }}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-text-primary mb-2">
          You&apos;re all set!
        </h1>
        <p className="text-text-muted text-sm mb-6 leading-relaxed">
          We&apos;ve received your information and our AI is reaching out to you right now.
        </p>
        <div className="space-y-3 text-left bg-brand-offwhite rounded-2xl p-5 mb-6">
          {[
            { icon: MessageSquare, label: "SMS sent to your phone", color: "text-green-500" },
            { icon: Phone, label: "AI voice call in ~30 seconds", color: "text-brand-dark" },
            { icon: Mail, label: "Follow-up email in ~1 minute", color: "text-brand-medium" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm text-text-primary">{item.label}</span>
            </div>
          ))}
        </div>
        <Link
          href="/"
          className="text-brand-dark hover:text-brand-medium text-sm font-semibold transition-colors"
        >
          &larr; Back to home
        </Link>
      </motion.div>
    </div>
  );
}
