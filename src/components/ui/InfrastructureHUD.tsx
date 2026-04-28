"use client";

/**
 * InfrastructureHUD — The Health Bar
 * 
 * Shows real-time Redis pressure monitoring:
 * - Redis Latency (ms) - Green → Amber at >10ms
 * - Payload Size (KB/MB)
 * - Cache Status (HIT/MISS)
 * 
 * Uses content-visibility: auto for zero-lag rendering
 */

import { TelemetryPulse } from "@/lib/telemetry";

interface Props {
  pulse: TelemetryPulse | null;
}

export function InfrastructureHUD({ pulse }: Props) {
  if (!pulse) return null;

  const { redisLatencyMs, payloadSize, source } = pulse;

  // Health bar color logic: Green → Amber at >10ms
  const getHealthColor = () => {
    if (redisLatencyMs === null || redisLatencyMs < 0) return "bg-gray-500";
    if (redisLatencyMs <= 5) return "bg-green-500";
    if (redisLatencyMs <= 10) return "bg-yellow-500";
    return "bg-amber-500";
  };

  const getHealthLabel = () => {
    if (redisLatencyMs === null || redisLatencyMs < 0) return "N/A";
    if (redisLatencyMs <= 5) return "Excellent";
    if (redisLatencyMs <= 10) return "Good";
    return "Pressure";
  };

  return (
    <div
      className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg border border-white/10 min-w-[280px]"
      style={{ contentVisibility: "auto" }}
    >
      <div className="text-xs font-mono space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <span className="font-semibold text-white/90">Infrastructure Health</span>
          <span className={`text-xs px-2 py-0.5 rounded ${getHealthColor()} text-white`}>
            {getHealthLabel()}
          </span>
        </div>

        {/* Redis Latency */}
        <div className="flex justify-between items-center">
          <span className="text-white/60">Redis Latency</span>
          <span className="font-semibold">
            {redisLatencyMs !== null && redisLatencyMs >= 0 ? `${redisLatencyMs}ms` : "N/A"}
          </span>
        </div>

        {/* Health Bar */}
        {redisLatencyMs !== null && redisLatencyMs >= 0 && (
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getHealthColor()}`}
              style={{ width: `${Math.min((redisLatencyMs / 20) * 100, 100)}%` }}
            />
          </div>
        )}

        {/* Payload Size */}
        <div className="flex justify-between items-center">
          <span className="text-white/60">Payload Size</span>
          <span className="font-semibold">{payloadSize}</span>
        </div>

        {/* Cache Status */}
        <div className="flex justify-between items-center">
          <span className="text-white/60">Cache Status</span>
          <span className="font-semibold">{source}</span>
        </div>
      </div>
    </div>
  );
}
