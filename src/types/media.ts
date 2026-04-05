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
  /**
   * Cloudinary public ID — works for both images and videos.
   * Can include folder path e.g. "mlrit/convocation-2024"
   * Find it in Cloudinary Media Library after upload.
   */
  cloudinaryPublicId: string;
  /** Width in pixels of the original file */
  width: number;
  /** Height in pixels of the original file */
  height: number;
  /** Base64 blur placeholder (tiny 4x4 px) — optional */
  blurDataURL?: string;
  /** ISO date string e.g. "2024-10-15" */
  capturedAt: string;
  tags?: string[];
}

export interface MediaGalleryFilter {
  category?: MediaCategory;
  type?: MediaType;
  search?: string;
}
