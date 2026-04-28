import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheInvalidatePattern } from "@/lib/redis";

const VALID_CATEGORIES = ["events", "campus", "sports", "academics", "cultural", "technical"];

export async function POST(request: NextRequest) {
  try {
    const { title, category, publicId, type } = await request.json();

    if (!title || !category || !publicId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (type !== "image" && type !== "video") {
      return NextResponse.json({ error: "type must be image or video" }, { status: 400 });
    }

    const media = await prisma.media.create({
      data: {
        title: title.trim(),
        category,
        cloudinaryPublicId: publicId,
        type,
        tags: JSON.stringify([category]),
      },
    });

    await Promise.all([
      cacheInvalidatePattern("media:*"),
      cacheInvalidatePattern("assets:*"),
    ]);

    return NextResponse.json({ success: true, id: media.id });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "File already uploaded" }, { status: 409 });
    }
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Failed to save media" }, { status: 500 });
  }
}
