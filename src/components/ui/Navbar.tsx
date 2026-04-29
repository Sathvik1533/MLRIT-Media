"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/upload",    label: "Upload" },
  { href: "/test-lab",  label: "Benchmark" },
  { href: "/gallery",   label: "Asset Library" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(248,250,252,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 48px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            MLRIT
          </span>
          <span
            style={{
              width: 1,
              height: 14,
              background: "rgba(0,0,0,0.14)",
              display: "block",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 600,
              color: "var(--text-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Media Platform
          </span>
        </Link>

        {/* Center nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 10,
            padding: "3px",
          }}
        >
          {LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "5px 14px",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--text)" : "var(--text-2)",
                  background: active ? "var(--surface)" : "transparent",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  textDecoration: "none",
                  transition: "color 150ms, background 150ms",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            className="live-dot"
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--green)",
              boxShadow: "0 0 6px var(--green)",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 600,
              color: "#059669",
              letterSpacing: "0.08em",
            }}
          >
            Live
          </span>
        </div>
      </div>
    </nav>
  );
}
