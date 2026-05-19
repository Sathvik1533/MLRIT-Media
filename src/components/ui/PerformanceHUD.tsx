"use client";

/**
 * PerformanceHUD — the "cockpit instrument panel" at the bottom of every page.
 *
 * Shows three live metrics after each API fetch:
 *   SOURCE  → Where the data came from (Redis pantry or DB kitchen)
 *   SPEED   → Round-trip ms (browser stopwatch)
 *   PAYLOAD → JSON payload size in KB (from Content-Length header)
 *
 * Design: thin amber bar, semi-transparent, fixed to viewport bottom.
 * Fades in once data is loaded — invisible during skeleton phase.
 */

import type { SessionPulse } from "@/lib/telemetry";

interface PerformanceHUDProps {
  pulse: SessionPulse | null;
}

export function PerformanceHUD({ pulse }: PerformanceHUDProps) {
  if (!pulse) return null;

  const sourceColor = pulse.source.includes("Redis") ? "#10b981" : "#F59E0B";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-1.5 text-xs font-mono backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.92)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 -1px 8px rgba(0,0,0,0.06)",
      }}
      aria-label="Performance telemetry"
    >
      {/* Left: Source indicator */}
      <span style={{ color: sourceColor }}>
        SOURCE: {pulse.source}
      </span>

      {/* Center: Speed */}
      <span style={{ color: "var(--text-2)" }}>
        LATENCY:{" "}
        <span
          style={{
            color: pulse.latency < 100 ? "#10b981" : pulse.latency < 300 ? "#F59E0B" : "#ef4444",
            fontWeight: 600,
          }}
        >
          {pulse.latency}ms
        </span>
        {pulse.serverTime > 0 && (
          <span style={{ color: "var(--text-3)", marginLeft: 4 }}>
            (server: {pulse.serverTime}ms)
          </span>
        )}
      </span>

      {/* Right: Payload */}
      <span style={{ color: "var(--text-2)" }}>
        PAYLOAD:{" "}
        <span style={{ color: "var(--text)", fontWeight: 600 }}>
          {pulse.payloadKB === "0.0" ? "—" : `${pulse.payloadKB} KB`}
        </span>
      </span>
    </div>
  );
}
