import { prisma as db } from "./db";
import type { MediaCategory, MediaType } from "@/types/media";

export interface GetMediaOptions {
  category?: MediaCategory;
  type?: MediaType;
  search?: string;
  limit?: number;
}

/**
 * Fetch media from database with optional filters
 */
export async function getMedia(options: GetMediaOptions = {}) {
  const { category, type, search, limit = 50 } = options;

  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const media = await db.media.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return media;
}

/**
 * Get media by ID
 */
export async function getMediaById(id: string) {
  return db.media.findUnique({
    where: { id },
  });
}

/**
 * Get media stats
 */
export async function getMediaStats() {
  const [total, images, videos] = await Promise.all([
    db.media.count(),
    db.media.count({ where: { type: "image" } }),
    db.media.count({ where: { type: "video" } }),
  ]);

  return { total, images, videos };
}
