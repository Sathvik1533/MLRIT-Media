"use client";

/**
 * InfrastructureHUD — dedicated "Health Bar" for Redis pressure monitoring.
 *
 * Shows three real-time Redis metrics in a compact panel:
 *   REDIS LATENCY  → How fast the pantry responded (ms)
 *   PAYLOAD SIZE   → How big was the response (KB/MB)
 *   CACHE STATUS   → HIT (pantry) or MISS (kitchen)
 *
 * Color behavior (the "spike"):
 *   Redis Latency < 10ms  → green  (healthy, Redis is doing its job)
 *   Redis Latency 10–30ms → amber  (slight pressure — maybe large payload)
 *   Redis Latency > 30ms  → red    (Redis under stress)
 *
 * This panel is separate from PerformanceHUD (which shows browser round-trip).
 * This one answers: "How is the PANTRY specifically performing?"
 *
 * Design: collapsible panel, top-right corner, non-blocking.
 * Uses content-visibility: auto — zero rendering cost when off-screen.
 */

import { useState } from "react";
import type { SessionPulse } from "@/lib/telemetry";

interface InfrastructureHUDProps {
  pulse: SessionPulse | null;
}

function getRedisColor(ms: number | null): string {
  if (ms === null) return "#6b7280"; // gray — Redis not configured
  if (ms < 10) return "#10b981";     // green — healthy
  if (ms < 30) return "#F59E0B";     // amber — moderate pressure
  return "#ef4444";                  // red — high pressure
}

function getRedisLabel(ms: number | null): string {
  if (ms === null) return "Not configured";
  if (ms < 10) return `${ms}ms ✓`;
  if (ms < 30) return `${ms}ms ⚠`;
  return `${ms}ms ✗`;
}

export function InfrastructureHUD({ pulse }: InfrastructureHUDProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Don't render at all during skeleton phase
  if (!pulse) return null;

  const redisColor = getRedisColor(pulse.redisLatencyMs);
  const isHit = pulse.source.includes("Redis");

  return (
    <div
      style={{
        position: "fixed",
        top: "72px", // below navbar
        right: "12px",
        zIndex: 40,
        fontFamily: "monospace",
        fontSize: "11px",
        contentVisibility: "auto",
      }}
    >
      {/* Header bar — always visible, click to collapse */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: collapsed ? "6px" : "6px 6px 0 0",
          padding: "4px 8px",
          cursor: "pointer",
          color: "#F59E0B",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "9px" }}>
          {/* Pulsing dot — green if Redis HIT, amber if MISS */}
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isHit ? "#10b981" : "#F59E0B",
              marginRight: "4px",
            }}
          />
        </span>
        INFRA HEALTH
        <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: "9px" }}>
          {collapsed ? "▼" : "▲"}
        </span>
      </button>

      {/* Collapsible metrics panel */}
      {!collapsed && (
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(0,0,0,0.1)",
            borderTop: "none",
            borderRadius: "0 0 6px 6px",
            padding: "8px 10px",
            minWidth: "180px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {/* Redis Latency — the "spike" metric */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-3)" }}>REDIS RTT</span>
            <span style={{ color: redisColor, fontWeight: 600 }}>
              {getRedisLabel(pulse.redisLatencyMs)}
            </span>
          </div>

          {/* Payload Size — small image vs 4K metadata */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-3)" }}>PAYLOAD</span>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>
              {pulse.payloadSize}
            </span>
          </div>

          {/* Cache Status */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-3)" }}>CACHE</span>
            <span
              style={{
                color: isHit ? "#10b981" : "#F59E0B",
                fontWeight: 600,
              }}
            >
              {isHit ? "HIT" : "MISS"}
            </span>
          </div>

          {/* Visual pressure bar — fills based on Redis latency */}
          <div
            style={{
              marginTop: "2px",
              height: "3px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: pulse.redisLatencyMs !== null
                  ? `${Math.min(100, (pulse.redisLatencyMs / 50) * 100)}%`
                  : "0%",
                background: redisColor,
                borderRadius: "2px",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          </div>
          <div style={{ color: "var(--text-3)", fontSize: "9px", textAlign: "right" }}>
            {pulse.redisLatencyMs !== null ? "0ms ← pressure bar → 50ms+" : "Redis offline"}
          </div>
        </div>
      )}
    </div>
  );
}
