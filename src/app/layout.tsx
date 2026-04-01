import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speed to Lead — Instant Response System",
  description:
    "Capture leads and respond instantly with AI-powered SMS, voice, and email automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
