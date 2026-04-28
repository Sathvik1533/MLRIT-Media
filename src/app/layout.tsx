import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLRIT Zero-Lag Media Architecture",
  description: "Performance-aware media system with real-time optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-2xl font-bold">
                <span className="text-blue-400">MLRIT</span> Media
              </a>
              <div className="flex gap-6">
                <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
                <a href="/gallery" className="hover:text-blue-400 transition-colors">Gallery</a>
                <a href="/videos" className="hover:text-blue-400 transition-colors">Videos</a>
                <a href="/test-lab" className="hover:text-green-400 transition-colors font-semibold">⚡ Test Lab</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-slate-900 text-white mt-auto py-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
            MLRIT Zero-Lag Architecture — {new Date().getFullYear()}
          </div>
        </footer>
      </body>
    </html>
  );
}
