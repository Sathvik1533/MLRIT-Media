import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/media/[id]/view
// Increments the view counter for a media asset by its cloudinaryPublicId
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const asset = await prisma.media.update({
      where: { cloudinaryPublicId: decodeURIComponent(id) },
      data: { views: { increment: 1 } },
      select: { cloudinaryPublicId: true, views: true },
    });
    return NextResponse.json(asset);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
