import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["700", "800"],
  display: "swap",
  preload: true,
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5400b1",
};

export const metadata: Metadata = {
  title: "Speed to Lead — AI-Powered Instant Response",
  description:
    "Capture leads and respond instantly with AI-powered SMS, voice, and email automation. Book appointments automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable}`}>
      <body className="min-h-screen bg-white text-[#1c1228] font-[family-name:var(--font-roboto)] antialiased">
        {children}
      </body>
    </html>
  );
}
