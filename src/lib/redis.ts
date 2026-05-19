/**
 * Upstash Redis client — the "pantry" that lives between the API and the DB.
 *
 * WHY Redis before the DB:
 *   DB query (SQLite file read) ≈ 5–20ms
 *   Redis in-memory fetch        ≈ 1–3ms
 *
 * When UPSTASH_REDIS_REST_URL is not set (local dev without credentials),
 * every cache call returns null and we fall through to the DB.
 * The gallery still works — it just won't get the cache benefit.
 */

import { Redis } from "@upstash/redis";

function makeRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = makeRedis();

// Returns the cached value AND how long the Redis fetch took (in ms)
// redisLatencyMs = -1 means Redis is not configured or call failed
export async function cacheGet<T>(key: string): Promise<{ value: T | null; redisLatencyMs: number }> {
  if (!redis) return { value: null, redisLatencyMs: -1 };
  const t0 = Date.now();
  try {
    const value = await redis.get<T>(key);
    return { value, redisLatencyMs: Date.now() - t0 };
  } catch {
    return { value: null, redisLatencyMs: -1 };
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // silent — cache failures should never break the app
  }
}

export const isRedisConfigured = !!redis;

// Deletes all Redis keys matching a glob pattern (e.g. "media:*")
// Called after uploads so stale cache entries don't hide new media
export async function cacheInvalidatePattern(pattern: string): Promise<number> {
  if (!redis) return 0;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    await Promise.all(keys.map((k) => redis!.del(k)));
    return keys.length;
  } catch {
    return 0;
  }
}

// ── Sliding-window rate limiter ─────────────────────────────────────────────
// Key: ratelimit:<ip>:<endpoint>  Score: Unix ms  Member: timestamp string
// Returns true (allow) or false (block). Fails open on Redis errors.
export async function checkRateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  if (!redis) return true;
  const key = `ratelimit:${ip}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - windowSec * 1000;
  try {
    await redis.zadd(key, { score: now, member: String(now) });
    await redis.zremrangebyscore(key, 0, windowStart);
    await redis.expire(key, windowSec * 2);
    const count = await redis.zcard(key);
    return count <= limit;
  } catch {
    return true; // fail open — never block legitimate traffic on Redis errors
  }
}

// ── Telemetry sorted set ────────────────────────────────────────────────────
// Key: "telemetry:requests"  Score: Unix ms timestamp  Member: JSON entry
// Sorted by score → oldest entries have the lowest scores and get trimmed first.

const TELEMETRY_KEY = "telemetry:requests";
const MAX_TELEMETRY_ENTRIES = 1000;

export async function logEntry(entry: {
  ts: number;
  ms: number;
  redisLatencyMs: number;
  cacheStatus: "HIT" | "MISS";
  payloadBytes: number;
}): Promise<void> {
  if (!redis) return;
  try {
    await redis.zadd(TELEMETRY_KEY, { score: entry.ts, member: JSON.stringify(entry) });
    // keep only the 1000 highest-scored (newest) entries
    await redis.zremrangebyrank(TELEMETRY_KEY, 0, -(MAX_TELEMETRY_ENTRIES + 1));
    // reset TTL so idle periods eventually clean up the key
    await redis.expire(TELEMETRY_KEY, 7200);
  } catch {
    // telemetry must never break the app
  }
}

export async function getEntries(limit: number): Promise<{
  ts: number;
  ms: number;
  redisLatencyMs: number;
  cacheStatus: "HIT" | "MISS";
  payloadBytes: number;
}[]> {
  if (!redis) return [];
  try {
    // rev: true → newest first, so slice(0, N) = last N requests
    const raw = await redis.zrange(TELEMETRY_KEY, 0, limit - 1, { rev: true });
    // Upstash auto-deserializes JSON members — entries may arrive as objects already
    return (raw as unknown[]).map((s) =>
      typeof s === "string" ? JSON.parse(s) : s
    ) as { ts: number; ms: number; redisLatencyMs: number; cacheStatus: "HIT" | "MISS"; payloadBytes: number }[];
  } catch (e) {
    console.error("[getEntries]", e);
    return [];
  }
}
