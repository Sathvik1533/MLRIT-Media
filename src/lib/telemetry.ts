/**
 * Telemetry - The Stopwatch
 * 
 * Wraps fetch() to measure latency and read server headers
 */

export interface TelemetryPulse {
  latency: number;          // total round-trip ms (browser → server → browser)
  serverTime: number;       // server-only processing ms (from header)
  source: "Redis ⚡" | "Database 🗄️";
  payloadKB: string;        // JSON payload size
  redisLatencyMs: number | null;  // Redis-only RTT in ms (null = not configured)
  payloadSize: string;      // Human-readable e.g. "1.9KB" or "4.2MB"
}

export async function traceFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; pulse: TelemetryPulse }> {
  const start = performance.now();
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  const end = performance.now();

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
