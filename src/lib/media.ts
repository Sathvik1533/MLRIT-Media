/**
 * Single source of truth for all media assets.
 *
 * HOW TO ADD MEDIA:
 * 1. Upload image to Cloudflare Images → copy the image ID
 * 2. For video: upload to R2 bucket → copy the object key
 * 3. Add an entry below with width/height from the original file
 * 4. Optional: generate a blur placeholder with `scripts/gen-blur.ts`
 */

import type { MediaAsset } from "@/types/media";

export const MEDIA_ASSETS: MediaAsset[] = [
  // --- PLACEHOLDER ASSETS (replace with real Cloudflare IDs) ---
  {
    id: "mlrit-convocation-2024",
    title: "Convocation 2024",
    description: "Annual convocation ceremony at MLRIT auditorium",
    type: "image",
    category: "events",
    cfImageId: "REPLACE_WITH_CF_IMAGE_ID",
    width: 1920,
    height: 1080,
    capturedAt: "2024-10-15",
    tags: ["convocation", "graduation", "2024"],
  },
  {
    id: "mlrit-campus-main-gate",
    title: "MLRIT Main Gate",
    description: "Main entrance of MLRIT campus",
    type: "image",
    category: "campus",
    cfImageId: "REPLACE_WITH_CF_IMAGE_ID",
    width: 1920,
    height: 1280,
    capturedAt: "2024-01-10",
    tags: ["campus", "gate"],
  },
  {
    id: "mlrit-techfest-2024",
    title: "TechFest 2024 Highlights",
    description: "Highlights from the annual technical festival",
    type: "video",
    category: "technical",
    r2Key: "videos/techfest-2024-highlights.mp4",
    width: 1920,
    height: 1080,
    capturedAt: "2024-03-20",
    tags: ["techfest", "technical", "2024"],
  },
];

/** Get all assets for a category */
export function getAssetsByCategory(
  category: MediaAsset["category"]
): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.category === category);
}

/** Get all image assets */
export function getImages(): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.type === "image");
}

/** Get all video assets */
export function getVideos(): MediaAsset[] {
  return MEDIA_ASSETS.filter((a) => a.type === "video");
}
