import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "MLRIT Media — Campus Life, Events & More",
  description:
    "Official media gallery of MLRIT — photos and videos from campus events, sports, cultural fests, and academics.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
          MLRIT Media — {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
