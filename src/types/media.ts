export type MediaType = "image" | "video";

export type MediaCategory =
  | "events"
  | "campus"
  | "sports"
  | "academics"
  | "cultural"
  | "technical";

export interface MediaAsset {
  id: string;
  title: string;
  description?: string;
  type: MediaType;
  category: MediaCategory;
  /** Cloudflare Images ID (for type: "image") */
  cfImageId?: string;
  /** Cloudflare R2 object key (for type: "video") */
  r2Key?: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Base64 blur placeholder (tiny 4x4 px) */
  blurDataURL?: string;
  /** ISO date string */
  capturedAt: string;
  tags?: string[];
}

export interface MediaGalleryFilter {
  category?: MediaCategory;
  type?: MediaType;
  search?: string;
}
