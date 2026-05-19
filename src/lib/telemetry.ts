/**
 * Telemetry Sensor — the "instrumented waiter."
 *
 * Instead of a regular fetch(), we wrap it with a stopwatch and
 * read the custom headers the API stamped on the response.
 *
 * The three "stamps" we read:
 *   X-Cache        → HIT (Redis pantry) or MISS (full DB kitchen)
 *   X-Response-Time → How long the server itself took (server-side ms)
 *   Content-Length  → Byte size of the JSON payload
 *
 * This runs in the browser — zero cost on the server side.
 */

export interface SessionPulse {
  latency: number;          // round-trip ms (browser stopwatch)
  serverTime: number;       // server-only processing ms (from header)
  source: "Redis ⚡" | "Database 🗄️";
  payloadKB: string;        // JSON payload size
  redisLatencyMs: number | null;  // Redis-only RTT in ms (null = not configured)
  payloadSize: string;      // Human-readable e.g. "1.9KB" or "4.2MB"
}

export async function traceFetch(
  url: string,
  options?: RequestInit
): Promise<{ data: unknown; pulse: SessionPulse }> {
  const start = performance.now(); // Start the stopwatch

  const response = await fetch(url, {
    ...options,
    // Always bypass browser cache so we measure real latency
    cache: "no-store",
  });

  const end = performance.now(); // Stop the stopwatch

  const data = await response.json();

  // Read the "stamps" the server put on the response
  const cacheHeader = response.headers.get("X-Cache") ?? "MISS";
  const serverMs = response.headers.get("X-Response-Time") ?? "0";
  const bytes = response.headers.get("Content-Length") ?? "0";
  const redisLatencyHeader = response.headers.get("X-Redis-Latency");
  const payloadSizeHeader = response.headers.get("X-Payload-Size") ?? "—";

  const byteCount = parseInt(bytes);
  const redisMs = redisLatencyHeader && redisLatencyHeader !== "N/A"
    ? parseInt(redisLatencyHeader)
    : null;

  return {
    data,
    pulse: {
      latency: Math.round(end - start),
      serverTime: parseInt(serverMs),
      source: cacheHeader === "HIT" ? "Redis ⚡" : "Database 🗄️",
      payloadKB: (byteCount / 1024).toFixed(1),
      redisLatencyMs: redisMs,
      payloadSize: payloadSizeHeader,
    },
  };
}
