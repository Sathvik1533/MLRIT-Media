import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MLRIT Media — Campus Life, Events & More",
  description:
    "Official media gallery of MLRIT — photos and videos from campus events, sports, cultural fests, and academics.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <Navbar />
        <div className="flex-1">{children}</div>
        <footer className="py-6 text-center text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--text-3)" }}>
          MLRIT Media — {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
