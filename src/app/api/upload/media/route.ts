import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { cacheInvalidatePattern, checkRateLimit } from "@/lib/redis";
import { autoTag } from "@/lib/autotag";
import { requireAdmin } from "@/lib/auth";
import { isS3Configured, s3Upload } from "@/lib/s3";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

const VALID_CATEGORIES = ["events", "campus", "sports", "academics", "cultural", "technical"];

function cloudinarySign(params: Record<string, string>): string {
  const str = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(str + API_SECRET).digest("hex");
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const allowed = await checkRateLimit(ip, "upload", 10, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded — max 10 uploads/minute" },
      { status: 429 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string | null)?.trim();
    const category = form.get("category") as string | null;
    const tagsRaw = (form.get("tags") as string | null) ?? "";
    const roleRaw = (form.get("role") as string | null)?.trim() || null;

    if (!file || !title || !category) {
      return NextResponse.json({ error: "Missing fields: file, title, category" }, { status: 400 });
    }

    const VALID_ROLES = ["hero", "banner", "thumbnail", "featured"];
    if (roleRaw && !VALID_ROLES.includes(roleRaw)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
    }

    const userTags = tagsRaw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const timestamp = String(Math.round(Date.now() / 1000));
    const folder = "mlrit";

    const signature = cloudinarySign({ folder, timestamp });

    const cdnForm = new FormData();
    cdnForm.append("file", file);
    cdnForm.append("folder", folder);
    cdnForm.append("timestamp", timestamp);
    cdnForm.append("api_key", API_KEY);
    cdnForm.append("signature", signature);

    const cdnRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      { method: "POST", body: cdnForm }
    );
    const cdn = await cdnRes.json();
    if (!cdnRes.ok || cdn.error) {
      return NextResponse.json(
        { error: cdn.error?.message ?? "Cloudinary upload failed" },
        { status: 502 }
      );
    }

    // For videos, pass a JPEG thumbnail URL — Claude can't read video streams.
    const urlForTagging = resourceType === "video"
      ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_800,h_450,c_fill,f_jpg,q_auto/${cdn.public_id}`
      : cdn.secure_url;

    const aiTags = await autoTag(urlForTagging, resourceType, category);
    const allTags = Array.from(new Set([category, ...userTags, ...aiTags]));

    // Upload original to S3 alongside Cloudinary (S3 failure is non-fatal)
    let s3Key: string | undefined;
    if (isS3Configured) {
      const ext = file.name.split(".").pop() ?? file.type.split("/")[1] ?? "bin";
      s3Key = `${cdn.public_id}.${ext}`;
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        await s3Upload(s3Key, buffer, file.type);
      } catch (e) {
        console.error("[upload/media] S3 upload failed (non-fatal):", e);
        s3Key = undefined;
      }
    }

    const media = await prisma.media.create({
      data: {
        title,
        category,
        cloudinaryPublicId: cdn.public_id,
        type: resourceType,
        tags: JSON.stringify(allTags),
        ...(roleRaw ? { role: roleRaw } : {}),
        ...(s3Key ? { s3Key } : {}),
      },
    });

    await Promise.all([
      cacheInvalidatePattern("media:*"),
      cacheInvalidatePattern("assets:*"),
    ]);

    return NextResponse.json({
      success: true,
      id: media.id,
      publicId: cdn.public_id,
      resourceType,
      format: cdn.format ?? file.type.split("/")[1],
      bytes: cdn.bytes ?? file.size,
      width: cdn.width,
      height: cdn.height,
      url: cdn.secure_url,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "File already uploaded" }, { status: 409 });
    }
    console.error("[upload/media]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
