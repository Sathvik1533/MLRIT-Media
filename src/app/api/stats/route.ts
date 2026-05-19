import { prisma } from "@/lib/db";
import { isRedisConfigured, logEntry, getEntries } from "@/lib/redis";

// logRequest is called fire-and-forget on every /api/media request.
// Signature is intentionally synchronous so callers don't need to await it.
export function logRequest(
  ms: number,
  cacheStatus: "HIT" | "MISS",
  payloadBytes: number,
  redisLatencyMs: number,
): void {
  void logEntry({ ts: Date.now(), ms, redisLatencyMs, cacheStatus, payloadBytes });
}

export async function GET() {
  const start = Date.now();

  // 1. Database health check
  let dbHealth: "OK" | "ERROR" = "ERROR";
  let totalAssets = 0;
  try {
    totalAssets = await prisma.media.count();
    dbHealth = "OK";
  } catch {
    dbHealth = "ERROR";
  }

  // 2. Fetch up to 1000 most-recent entries from Redis (newest-first)
  const log = await getEntries(1000);

  // 3. Requests in the last 60 seconds
  const oneMinuteAgo = Date.now() - 60_000;
  const requestsPerMinute = log.filter((r) => r.ts > oneMinuteAgo).length;

  // getEntries returns newest-first, so slice(0, N) = last N requests
  const last5 = log.slice(0, 5);
  const last20 = log.slice(0, 20);

  // 4. Average latency of last 5 requests
  const avgLatency =
    last5.length > 0
      ? Math.round(last5.reduce((sum, r) => sum + r.ms, 0) / last5.length)
      : 0;

  // 5. Cache hit rate of last 20 requests
  const hitCount = last20.filter((r) => r.cacheStatus === "HIT").length;
  const hitRate = last20.length > 0 ? Math.round((hitCount / last20.length) * 100) : 0;

  // 6. Average payload size of last 5 requests
  const avgPayloadBytes =
    last5.length > 0
      ? Math.round(last5.reduce((sum, r) => sum + r.payloadBytes, 0) / last5.length)
      : 0;

  // 7. Average Redis-specific latency of last 5 requests
  const last5Redis = last5.filter((r) => r.redisLatencyMs >= 0);
  const avgRedisLatency =
    last5Redis.length > 0
      ? Math.round(last5Redis.reduce((sum, r) => sum + r.redisLatencyMs, 0) / last5Redis.length)
      : null;

  const responseMs = Date.now() - start;

  return Response.json({
    status: dbHealth === "OK" ? "healthy" : "degraded",
    db: {
      health: dbHealth,
      totalAssets,
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
