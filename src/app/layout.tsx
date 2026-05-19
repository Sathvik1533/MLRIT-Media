import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import { tenant } from "@/config/tenant";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `Media Performance Observatory — ${tenant.shortName}`,
  description: "Real-time CDN performance benchmarking, Redis cache analysis, and media optimization platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-geist), system-ui, sans-serif" }}>
        <Navbar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
