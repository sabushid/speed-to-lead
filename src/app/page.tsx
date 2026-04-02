"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Mail, Clock, Zap, Calendar } from "lucide-react";
import LeadForm from "@/components/lead-form";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-[20px]">
        <div className="max-w-[1140px] mx-auto px-6 py-4 flex items-center justify-between">
          <Image
            src="/images/logo.png"
            alt="Rushanet"
            width={140}
            height={40}
            className="brightness-0 invert"
            priority
          />
          <a
            href="/dashboard"
            className="text-sm text-white/70 hover:text-white transition-all duration-200 px-4 py-2 rounded-full hover:bg-white/10"
          >
            Dashboard
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "linear-gradient(170deg, #5400b1 0%, #3a0080 60%, #1c0050 100%)" }}>
        {/* Subtle gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-medium/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-brand-light/15 rounded-full blur-[100px]" />

        <div className="relative max-w-[1140px] mx-auto px-6 pt-32 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                AI-Powered Instant Response
              </div>

              <h1 className="font-[family-name:var(--font-heading)] text-white leading-tight mb-6">
                <span className="block text-lg font-light text-brand-light/80 mb-2">
                  Never lose a lead again
                </span>
                <span className="block text-[clamp(32px,5vw,52px)] font-black">
                  We respond in{" "}
                  <em className="not-italic bg-gradient-to-r from-brand-light to-white bg-clip-text text-transparent">
                    seconds
                  </em>
                </span>
                <span className="block text-[clamp(20px,3vw,28px)] font-light text-white/70 mt-2">
                  not hours, not days
                </span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg">
                Drop your info below and our AI reaches out via text, call, and
                email — instantly. No waiting. No missed opportunities.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: MessageSquare, value: "<5s", label: "SMS Response" },
                  { icon: Phone, value: "30s", label: "AI Voice Call" },
                  { icon: Mail, value: "60s", label: "Email Follow-up" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm text-center"
                  >
                    <stat.icon className="w-5 h-5 text-brand-light mx-auto mb-2" />
                    <div className="text-2xl font-extrabold text-brand-light font-[family-name:var(--font-heading)]">
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-[24px] p-8 lg:p-10"
              style={{ boxShadow: "0 32px 80px rgba(84,0,177,0.25), 0 4px 20px rgba(0,0,0,0.1)" }}
            >
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-text-primary mb-2">
                Get in touch
              </h3>
              <p className="text-text-muted text-sm mb-6 leading-relaxed">
                Fill out the form and we&apos;ll be in your inbox and on your
                phone before you finish reading this.
              </p>
              <LeadForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-brand-offwhite">
        <div className="max-w-[1140px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[0.78rem] font-semibold uppercase tracking-widest text-brand-dark bg-brand-dark/6 px-4 py-1.5 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(28px,4vw,36px)] font-extrabold text-text-primary">
              From lead to appointment in{" "}
              <em className="not-italic bg-gradient-to-r from-brand-dark to-brand-medium bg-clip-text text-transparent">
                under 2 minutes
              </em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, step: "01", title: "Lead Captured", desc: "Form submitted on your landing page or ad" },
              { icon: MessageSquare, step: "02", title: "Instant SMS", desc: "AI sends a personalized text with booking link" },
              { icon: Phone, step: "03", title: "AI Voice Call", desc: "Automated call greets them by name" },
              { icon: Calendar, step: "04", title: "Appointment Booked", desc: "Lead books directly on your calendar" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-white rounded-[20px] p-8 border border-brand-dark/6 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1.5 hover:border-brand-light"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(84,0,177,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.04)"; }}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-dark/6 flex items-center justify-center mb-5 group-hover:bg-brand-dark group-hover:text-white transition-all duration-300">
                  <item.icon className="w-6 h-6 text-brand-dark group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-xs font-semibold text-brand-light mb-2 font-[family-name:var(--font-heading)]">
                  STEP {item.step}
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(170deg, #5400b1 0%, #3a0080 100%)" }}>
        <div className="max-w-[1140px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[0.78rem] font-semibold uppercase tracking-widest text-brand-light/80 bg-white/10 px-4 py-1.5 rounded-full mb-4">
              Results
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(28px,4vw,36px)] font-extrabold text-white mb-12">
              Speed wins deals
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: "78%", label: "of buyers choose the first responder" },
              { value: "100x", label: "more likely to connect in 5 min" },
              { value: "<5s", label: "average response time" },
              { value: "3x", label: "more appointments booked" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="text-[2.6rem] font-extrabold text-brand-light font-[family-name:var(--font-heading)]">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm mt-2 leading-relaxed">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[700px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(28px,4vw,36px)] font-extrabold text-text-primary mb-4">
              Ready to never miss a lead again?
            </h2>
            <p className="text-text-muted text-lg mb-8 leading-relaxed">
              Start capturing and converting leads faster than your competition.
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-block px-10 py-4 rounded-full text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #5400b1, #804dd3)",
                boxShadow: "0 4px 20px rgba(84,0,177,0.4)",
              }}
            >
              Get Started Now
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark py-8 px-6">
        <div className="max-w-[1140px] mx-auto text-center text-white/50 text-sm">
          Speed to Lead &mdash; AI-Powered Instant Response System
        </div>
      </footer>
    </div>
  );
}
