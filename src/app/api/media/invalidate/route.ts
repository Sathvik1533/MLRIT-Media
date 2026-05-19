import { NextRequest, NextResponse } from "next/server";
import { cacheInvalidatePattern } from "@/lib/redis";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const deleted = await cacheInvalidatePattern("media:*");
  return NextResponse.json({ success: true, keysDeleted: deleted });
}
