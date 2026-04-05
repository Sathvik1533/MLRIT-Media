"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/videos", label: "Videos" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: "rgba(10,10,10,0.85)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg tracking-tight"
          style={{ fontFamily: "var(--font-fraunces)", fontWeight: 900 }}
        >
          MLRIT <span style={{ color: "var(--accent)" }}>Media</span>
        </Link>
        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
              style={
                pathname === href
                  ? { background: "var(--surface-3)", color: "var(--text)" }
                  : { color: "var(--text-2)" }
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
