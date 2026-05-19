import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { cacheInvalidatePattern } from "@/lib/redis";
import { requireAdmin } from "@/lib/auth";

const CLOUD      = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY    = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

const VALID_CATEGORIES = ["events","campus","sports","academics","cultural","technical"];

function sign(params: Record<string, string>): string {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(str + API_SECRET).digest("hex");
}

async function destroyOnCloudinary(publicId: string, resourceType: "image" | "video") {
  const timestamp = String(Math.round(Date.now() / 1000));
  const signature = sign({ public_id: publicId, timestamp });
  const form = new FormData();
  form.append("public_id", publicId);
  form.append("timestamp", timestamp);
  form.append("api_key", API_KEY);
  form.append("signature", signature);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/destroy`,
    { method: "POST", body: form }
  );
  return res.json();
}

// DELETE /api/assets/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(_req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await destroyOnCloudinary(
      media.cloudinaryPublicId,
      media.type === "video" ? "video" : "image"
    );
    await prisma.media.delete({ where: { id } });
    await Promise.all([
      cacheInvalidatePattern("assets:*"),
      cacheInvalidatePattern("media:*"),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/assets/[id]]", err);
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}

const VALID_ROLES = ["hero", "banner", "thumbnail", "featured"];

// PATCH /api/assets/[id]  — body: { title?, category?, description?, role? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const { title, category, description, role } = await req.json();
    if (title !== undefined && typeof title !== "string") {
      return NextResponse.json({ success: false, error: "title must be a string" }, { status: 400 });
    }
    if (title !== undefined && title.trim() === "") {
      return NextResponse.json({ success: false, error: "Title cannot be empty" }, { status: 400 });
    }
    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 });
    }
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json({ success: false, error: "description must be a string" }, { status: 400 });
    }
    if (role !== undefined && role !== null && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: `role must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
    }
    const data: Record<string, string | null> = {};
    if (title)                     data.title       = title.trim();
    if (category)                  data.category    = category;
    if (description !== undefined) data.description = description.trim() || null;
    if (role !== undefined)        data.role        = role ?? null;
    if (!Object.keys(data).length) {
      return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
    }
    const updated = await prisma.media.update({ where: { id }, data });
    await Promise.all([
      cacheInvalidatePattern("assets:*"),
      cacheInvalidatePattern("media:*"),
    ]);
    return NextResponse.json({ success: true, id: updated.id });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    console.error("[PATCH /api/assets/[id]]", err);
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
