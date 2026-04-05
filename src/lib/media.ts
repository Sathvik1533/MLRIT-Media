/**
 * Single source of truth for all media assets.
 *
 * HOW TO ADD MEDIA:
 * 1. Upload image or video to Cloudinary Media Library (cloudinary.com/console)
 * 2. Copy the "Public ID" shown in the asset details panel
 *    e.g. "mlrit/convocation-2024" (folder/filename without extension)
 * 3. Add an entry below — set width/height from the original file
 * 4. Run `npm run dev` and verify it loads
 */

import type { MediaAsset } from "@/types/media";

export const MEDIA_ASSETS: MediaAsset[] = [
  // --- PLACEHOLDER ASSETS (replace cloudinaryPublicId with real Cloudinary public IDs) ---
  {
    id: "mlrit-convocation-2024",
    title: "Convocation 2024",
    description: "Annual convocation ceremony at MLRIT auditorium",
    type: "image",
    category: "events",
    cloudinaryPublicId: "REPLACE_WITH_CLOUDINARY_PUBLIC_ID",
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
    cloudinaryPublicId: "REPLACE_WITH_CLOUDINARY_PUBLIC_ID",
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
    cloudinaryPublicId: "REPLACE_WITH_CLOUDINARY_PUBLIC_ID",
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
