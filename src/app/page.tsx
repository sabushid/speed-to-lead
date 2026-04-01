import LeadForm from "@/components/lead-form";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">SpeedToLead</h1>
          <a
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Dashboard
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <div className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
              AI-Powered Instant Response
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
              We respond to your inquiry{" "}
              <span className="text-blue-600">in seconds</span>, not hours
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Drop your info below and our AI will reach out via text, call, and
              email — instantly. No waiting around. No missed opportunities.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">&lt;5s</div>
                <div className="text-sm text-gray-500 mt-1">SMS Response</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">30s</div>
                <div className="text-sm text-gray-500 mt-1">AI Voice Call</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">60s</div>
                <div className="text-sm text-gray-500 mt-1">Email Follow-up</div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Get in touch
            </h3>
            <p className="text-gray-500 mb-6">
              Fill out the form and we&apos;ll be in your inbox and on your phone before you finish reading this.
            </p>
            <LeadForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          Speed to Lead &mdash; AI-Powered Instant Response System
        </div>
      </footer>
    </div>
  );
}
