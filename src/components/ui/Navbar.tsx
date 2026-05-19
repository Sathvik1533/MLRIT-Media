"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tenant } from "@/config/tenant";

const LINKS = [
  { href: "/upload",    label: "Upload" },
  { href: "/test-lab",  label: "Benchmark" },
  { href: "/gallery",   label: "Asset Library" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* Main bar */}
      <div
        className="mx-auto px-4 md:px-12 flex items-center justify-between"
        style={{ maxWidth: 1200, height: 52 }}
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {tenant.shortName}
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

        {/* Center nav — hidden on mobile */}
        <div
          className="hidden md:flex items-center gap-0.5 rounded-[10px] p-[3px]"
          style={{
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.07)",
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Live indicator — always visible */}
          <div className="flex items-center gap-1.5">
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

          {/* Hamburger button — visible on mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-11 h-11 rounded-lg gap-[5px]"
            style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.07)" }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className="block rounded-full transition-all duration-200"
              style={{
                width: 16,
                height: 1.5,
                background: "var(--text-2)",
                transformOrigin: "center",
                transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block rounded-full transition-all duration-200"
              style={{
                width: 16,
                height: 1.5,
                background: "var(--text-2)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block rounded-full transition-all duration-200"
              style={{
                width: 16,
                height: 1.5,
                background: "var(--text-2)",
                transformOrigin: "center",
                transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden px-4 pb-3 flex flex-col gap-1"
          style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
        >
          {LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl py-3 px-4 text-sm font-medium transition-all duration-150 no-underline"
                style={{
                  color: active ? "var(--text)" : "var(--text-2)",
                  background: active ? "var(--surface-2)" : "transparent",
                  fontWeight: active ? 600 : 500,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
