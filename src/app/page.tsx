import Image from "next/image";
import LeadForm from "@/components/lead-form";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark">
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
        {/* Decorative orbs — no blur for mobile performance */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-medium/10 rounded-full" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-brand-light/8 rounded-full" />

        <div className="relative max-w-[1140px] mx-auto px-6 pt-32 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Copy */}
            <div className="animate-fadeUp">
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

              <ul className="space-y-2.5 mb-10 max-w-lg">
                {[
                  "Instant SMS + Email",
                  "AI calling leads in seconds",
                  "AI talking like a human",
                  "Qualification happening live",
                  "Appointments booked automatically",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/80 text-base">
                    <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { svg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', value: "<5s", label: "SMS Response", delay: "0.1s" },
                  { svg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>', value: "30s", label: "AI Voice Call", delay: "0.2s" },
                  { svg: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>', value: "60s", label: "Email Follow-up", delay: "0.3s" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4  text-center animate-fadeUp" style={{ animationDelay: stat.delay }}>
                    <svg className="w-5 h-5 text-brand-light mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: stat.svg }} />
                    <div className="text-2xl font-extrabold text-brand-light font-[family-name:var(--font-heading)]">{stat.value}</div>
                    <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div
              className="bg-white rounded-[24px] p-8 lg:p-10 animate-fadeUp"
              style={{ boxShadow: "0 32px 80px rgba(84,0,177,0.25), 0 4px 20px rgba(0,0,0,0.1)", animationDelay: "0.15s" }}
            >
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-text-primary mb-2">
                Get in touch
              </h3>
              <p className="text-text-muted text-sm mb-6 leading-relaxed">
                Fill out the form and we&apos;ll be in your inbox and on your
                phone before you finish reading this.
              </p>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-brand-offwhite">
        <div className="max-w-[1140px] mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[0.78rem] font-semibold uppercase tracking-widest text-brand-dark bg-brand-dark/6 px-4 py-1.5 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-[clamp(28px,4vw,36px)] font-extrabold text-text-primary">
              From lead to appointment in{" "}
              <em className="not-italic bg-gradient-to-r from-brand-dark to-brand-medium bg-clip-text text-transparent">
                under 2 minutes
              </em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { svg: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>', step: "01", title: "Lead Captured", desc: "Form submitted on your landing page or ad" },
              { svg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', step: "02", title: "Instant SMS & Email", desc: "AI sends a personalized text and email with booking link" },
              { svg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>', step: "03", title: "AI Voice Call", desc: "Automated call greets them by name" },
              { svg: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>', step: "04", title: "Appointment Booked", desc: "Lead books directly on your calendar" },
            ].map((item) => (
              <div
                key={item.step}
                className="group bg-white rounded-[20px] p-8 border border-brand-dark/6 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1.5 hover:border-brand-light hover:shadow-[0_20px_60px_rgba(84,0,177,0.12)]"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-dark/6 flex items-center justify-center mb-5 group-hover:bg-brand-dark transition-all duration-300">
                  <svg className="w-6 h-6 text-brand-dark group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: item.svg }} />
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(170deg, #5400b1 0%, #3a0080 100%)" }}>
        <div className="max-w-[1140px] mx-auto text-center">
          <span className="inline-block text-[0.78rem] font-semibold uppercase tracking-widest text-brand-light/80 bg-white/10 px-4 py-1.5 rounded-full mb-4">
            Results
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(28px,4vw,36px)] font-extrabold text-white mb-12">
            Speed wins deals
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: "78%", label: "of buyers choose the first responder" },
              { value: "100x", label: "more likely to connect in 5 min" },
              { value: "<5s", label: "average response time" },
              { value: "3x", label: "more appointments booked" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 "
              >
                <div className="text-[2.6rem] font-extrabold text-brand-light font-[family-name:var(--font-heading)]">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm mt-2 leading-relaxed">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(28px,4vw,36px)] font-extrabold text-text-primary mb-4">
            Ready to never miss a lead again?
          </h2>
          <p className="text-text-muted text-lg mb-8 leading-relaxed">
            Start capturing and converting leads faster than your competition.
          </p>
          <a
            href="#top"
            className="inline-block px-10 py-4 rounded-full text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #5400b1, #804dd3)",
              boxShadow: "0 4px 20px rgba(84,0,177,0.4)",
            }}
          >
            Get Started Now
          </a>
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

