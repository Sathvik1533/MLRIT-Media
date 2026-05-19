import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const IMG_BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const VID_BASE = `https://res.cloudinary.com/${CLOUD}/video/upload`;

const VALID_ROLES = ["hero", "banner", "thumbnail", "featured"] as const;
type Role = typeof VALID_ROLES[number];

function toAsset(row: {
  id: string;
  cloudinaryPublicId: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  tags: string;
  role: string | null;
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
    category: row.category,
    type: row.type,
    tags,
    role: row.role ?? null,
    thumbnailUrl,
    fullUrl,
    width: isVideo ? 854 : 1920,
    height: isVideo ? 480 : 1080,
    capturedAt: row.createdAt.toISOString().split("T")[0],
    views: row.views,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort"); // "views" for top assets
    const tag = searchParams.get("tag");   // exact tag match
    const role = searchParams.get("role"); // e.g. "hero", "banner", "thumbnail", "featured"
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;

    if (role && !VALID_ROLES.includes(role as Role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    // Skip cache for view-sorted queries (views change frequently)
    const skipCache = sort === "views";
    const cacheKey = `assets:${category ?? "all"}:${type ?? "all"}:${q ?? "null"}:${tag ?? "null"}:${role ?? "null"}`;

    if (!skipCache) {
      const { value: cached } = await cacheGet<ReturnType<typeof toAsset>[]>(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, assets: cached, total: cached.length });
      }
    }

    const rows = await prisma.media.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(type ? { type } : {}),
        ...(role ? { role } : {}),
        // Exact JSON-element match: searches for `"tagname"` (with quotes) in the stored JSON string
        ...(tag ? { tags: { contains: `"${tag}"` } } : {}),
        ...(q
          ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { tags: { contains: q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: sort === "views" ? { views: "desc" } : { createdAt: "desc" },
      ...(limit ? { take: limit } : {}),
    });

    const assets = rows.map(toAsset);
    if (!skipCache) await cacheSet(cacheKey, assets, 60);

    return NextResponse.json({ success: true, assets, total: assets.length });
  } catch (err) {
    console.error("[GET /api/assets]", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
