/**
 * Infrastructure Health Monitoring
 * 
 * Ring Buffer: Tracks last 100 requests in memory
 * Provides real-time metrics for the Health Bar
 */

import { prisma } from "@/lib/db";
import { isRedisConfigured } from "@/lib/redis";

// Ring buffer: last 100 requests with full pressure metrics
interface RequestEntry {
  ts: number;             // Unix ms timestamp
  ms: number;             // Total server processing latency
  redisLatencyMs: number; // Just the Redis round-trip (-1 = not configured)
  cacheStatus: "HIT" | "MISS";
  payloadBytes: number;   // Size of the JSON payload returned
}

const requestLog: RequestEntry[] = [];

export function logRequest(
  ms: number,
  cacheStatus: "HIT" | "MISS",
  payloadBytes: number,
  redisLatencyMs: number,
) {
  requestLog.push({ ts: Date.now(), ms, redisLatencyMs, cacheStatus, payloadBytes });
  if (requestLog.length > 100) requestLog.shift(); // keep last 100
}

export async function GET() {
  const start = Date.now();

  // 1. Total media count
  const totalMedia = await prisma.media.count();

  // 2. Requests per minute (count requests in last 60 seconds)
  const oneMinuteAgo = Date.now() - 60_000;
  const requestsPerMinute = requestLog.filter((r) => r.ts >= oneMinuteAgo).length;

  // 3. Average latency of last 5 requests
  const last5 = requestLog.slice(-5);
  const avgLatency =
    last5.length > 0
      ? Math.round(last5.reduce((sum, r) => sum + r.ms, 0) / last5.length)
      : 0;

  // 4. Cache efficiency — how many of last 20 requests were Redis HITs?
  const last20 = requestLog.slice(-20);
  const hitCount = last20.filter((r) => r.cacheStatus === "HIT").length;
  const hitRate = last20.length > 0 ? Math.round((hitCount / last20.length) * 100) : 0;

  // 5. Average payload size of last 5 requests
  const avgPayloadBytes =
    last5.length > 0
      ? Math.round(last5.reduce((sum, r) => sum + r.payloadBytes, 0) / last5.length)
      : 0;

  // 6. Average Redis-specific latency of last 5 requests
  const last5Redis = last5.filter((r) => r.redisLatencyMs >= 0);
  const avgRedisLatency =
    last5Redis.length > 0
      ? Math.round(last5Redis.reduce((sum, r) => sum + r.redisLatencyMs, 0) / last5Redis.length)
      : null;

  const responseMs = Date.now() - start;

  return Response.json({
    status: "healthy",
    db: {
      totalMedia,
      connected: true,
    },
    cache: {
      configured: isRedisConfigured,
      provider: isRedisConfigured ? "Upstash Redis" : "None (direct DB)",
      hitRatePct: hitRate,
      hitCount,
      missCount: last20.length - hitCount,
      sampledFrom: last20.length,
    },
    load: {
      requestsPerMinute,
      avgLatencyMs: avgLatency,
      avgRedisLatencyMs: avgRedisLatency,
      avgPayloadBytes,
      avgPayloadKB: (avgPayloadBytes / 1024).toFixed(1),
      lastCheckedMs: responseMs,
    },
    timestamp: new Date().toISOString(),
  });
}
