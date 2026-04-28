"use client";

/**
 * PerformanceHUD — Bottom telemetry bar
 * Shows round-trip metrics
 */

import { TelemetryPulse } from "@/lib/telemetry";

interface Props {
  pulse: TelemetryPulse | null;
}

export function PerformanceHUD({ pulse }: Props) {
  if (!pulse) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-white/10"
      style={{ contentVisibility: "auto" }}
    >
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex gap-6">
          <div>
            <span className="text-white/60">Latency: </span>
            <span className="font-semibold">{pulse.latency}ms</span>
          </div>
          <div>
            <span className="text-white/60">Server: </span>
            <span className="font-semibold">{pulse.serverTime}ms</span>
          </div>
          <div>
            <span className="text-white/60">Source: </span>
            <span className="font-semibold">{pulse.source}</span>
          </div>
          <div>
            <span className="text-white/60">Size: </span>
            <span className="font-semibold">{pulse.payloadKB}KB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
