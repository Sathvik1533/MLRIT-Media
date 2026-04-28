import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("id");

  if (!assetId) {
    return NextResponse.json({ error: "Asset ID required" }, { status: 400 });
  }

  const cacheKey = `test-asset:${assetId}`;
  let cacheStatus: "HIT" | "MISS" = "MISS";
  let redisLatency = 0;

  // Try Redis first
  const redisStart = performance.now();
  const { value: cached } = await cacheGet<any>(cacheKey);
  redisLatency = performance.now() - redisStart;

  let asset;
  if (cached) {
    asset = cached;
    cacheStatus = "HIT";
  } else {
    // Query database
    asset = await prisma.media.findUnique({
      where: { id: assetId },
    });

    if (asset) {
      // Cache for 5 minutes
      await cacheSet(cacheKey, asset, 300);
    }
  }

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const totalTime = performance.now() - startTime;
  const payload = JSON.stringify(asset);
  const payloadSize = Buffer.byteLength(payload);

  return NextResponse.json({
    asset,
    type: asset.type,
    size: asset.description?.includes("small") ? "small" : 
          asset.description?.includes("medium") ? "medium" : "large",
    cacheStatus,
    redisLatency: Math.round(redisLatency * 100) / 100,
    totalTime: Math.round(totalTime * 100) / 100,
    payloadSize,
  }, {
    headers: {
      "X-Cache": cacheStatus,
      "X-Redis-Latency": redisLatency.toFixed(2),
      "X-Response-Time": totalTime.toFixed(2),
    },
  });
}
