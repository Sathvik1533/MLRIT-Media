/**
 * GET /api/media
 *
 * The "Kitchen" — but with a "Pantry" (Redis) check first.
 *
 * Flow:
 *   1. Start server stopwatch
 *   2. Check Redis cache (the pantry)
 *   3. If miss → query SQLite DB → store in Redis for 60s
 *   4. Transform DB rows → MediaAsset shape
 *   5. Stamp response headers (X-Cache, X-Response-Time, Content-Length)
 *   6. Return JSON
 *
 * Supports query params: ?category=sports &type=image &q=search
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import { logRequest } from "@/app/api/stats/route";
import type { MediaCategory, MediaType } from "@/types/media";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const IMG_BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const VID_BASE = `https://res.cloudinary.com/${CLOUD}/video/upload`;

// Transform a DB row to the MediaAsset shape the UI expects
function toMediaAsset(row: {
  id: string;
  cloudinaryPublicId: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  tags: string;
  views: number;
  createdAt: Date;
}) {
  const isVideo = row.type === "video";
  const thumbnailUrl = isVideo
    ? `${VID_BASE}/w_400,h_225,c_fill,f_jpg,q_auto/${row.cloudinaryPublicId}`
    : `${IMG_BASE}/w_400,h_300,c_fill,f_auto,q_auto/${row.cloudinaryPublicId}`;
  const fullUrl = isVideo
    ? `${VID_BASE}/${row.cloudinaryPublicId}`
    : `${IMG_BASE}/f_auto,q_auto/${row.cloudinaryPublicId}`;

  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags) as string[];
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    cloudinaryPublicId: row.cloudinaryPublicId,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category as MediaCategory,
    type: row.type as MediaType,
    tags,
    thumbnailUrl,
    fullUrl,
    width: isVideo ? 854 : 1920,
    height: isVideo ? 480 : 1080,
    capturedAt: row.createdAt.toISOString().split("T")[0],
    views: row.views,
  };
}

export async function GET(request: NextRequest) {
  const serverStart = Date.now(); // Server-side stopwatch

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as MediaCategory | null;
  const type = searchParams.get("type") as MediaType | null;
  const q = searchParams.get("q");

  // Build a cache key that includes the filters
  // e.g. "media:sports:image:null" — different filters = different cache entries
  const cacheKey = `media:${category ?? "all"}:${type ?? "all"}:${q ?? "null"}`;

  let assets: ReturnType<typeof toMediaAsset>[];
  let cacheStatus = "MISS";
  let redisLatencyMs = -1;

  // Step 1: Try the pantry (Redis) — also captures how long Redis took
  const { value: cached, redisLatencyMs: rtt } = await cacheGet<ReturnType<typeof toMediaAsset>[]>(cacheKey);
  redisLatencyMs = rtt;

  if (cached) {
    assets = cached;
    cacheStatus = "HIT";
  } else {
    // Step 2: Go to the kitchen (DB)
    const rows = await prisma.media.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(type ? { type } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { tags: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    assets = rows.map(toMediaAsset);

    // Step 3: Store in pantry for next time (60s TTL)
    await cacheSet(cacheKey, assets, 60);
    cacheStatus = "MISS";
  }

  const payload = JSON.stringify({ assets, total: assets.length });
  const serverMs = Date.now() - serverStart;
  const payloadBytes = Buffer.byteLength(payload);

  // Record this request in the pressure monitor ring buffer
  logRequest(serverMs, cacheStatus as "HIT" | "MISS", payloadBytes, redisLatencyMs);

  const payloadKB = (payloadBytes / 1024).toFixed(1);

  return new Response(payload, {
    headers: {
      "Content-Type": "application/json",
      // Telemetry stamps — read by PerformanceHUD via traceFetch()
      "X-Cache": cacheStatus,
      "X-Response-Time": `${serverMs}`,
      "Content-Length": payloadBytes.toString(),
      // NEW: Redis-specific latency + payload size for InfrastructureHUD
      "X-Redis-Latency": redisLatencyMs >= 0 ? `${redisLatencyMs}` : "N/A",
      "X-Payload-Size": `${payloadKB}KB`,
      // Expose all custom headers to the browser (CORS rule)
      "Access-Control-Expose-Headers":
        "X-Cache, X-Response-Time, Content-Length, X-Redis-Latency, X-Payload-Size",
    },
  });
}
