import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(170deg, #f7f5fc 0%, #e5ebf8 100%)" }}>
      <header className="bg-brand-dark/95 backdrop-blur-[20px] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">
              SpeedToLead
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/10"
            >
              Dashboard
            </Link>
          </div>
          <Link
            href="/"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Landing Page
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
