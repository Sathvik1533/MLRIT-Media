/**
 * Redis Singleton Connection
 * 
 * The "One Door" Pattern:
 * - This file runs ONCE when the server starts
 * - All requests share the SAME Redis connection
 * - Prevents connection leaks during bulk uploads
 */

import { Redis } from "@upstash/redis";

function makeRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("⚠️  Redis not configured - falling back to DB only");
    return null;
  }

  console.log("✅ Redis Singleton created - one door for all requests");
  return new Redis({ url, token });
}

// THE SINGLETON: This runs once, Node.js caches this module
const redis = makeRedis();

export const isRedisConfigured = redis !== null;

/**
 * Get from cache with latency measurement
 * Returns: { value, redisLatencyMs }
 */
export async function cacheGet<T>(key: string): Promise<{ value: T | null; redisLatencyMs: number }> {
  if (!redis) return { value: null, redisLatencyMs: -1 };
  
  const t0 = performance.now();
  try {
    const value = await redis.get<T>(key);
    const latency = Math.round(performance.now() - t0);
    return { value, redisLatencyMs: latency };
  } catch (err) {
    console.error("Redis GET error:", err);
    return { value: null, redisLatencyMs: -1 };
  }
}

/**
 * Set to cache with TTL
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error("Redis SET error:", err);
  }
}
