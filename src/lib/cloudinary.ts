/**
 * Cloudinary URL builders for zero-cost media delivery.
 *
 * WHY this file exists: all CDN logic lives here so components never
 * hard-code URLs. Swap CDN provider by changing only this file.
 *
 * Cloudinary free tier: 25 GB storage + 25 GB bandwidth/month. No card needed.
 *
 * URL format:
 *   Images: https://res.cloudinary.com/{cloud_name}/image/upload/{transforms}/{public_id}
 *   Videos: https://res.cloudinary.com/{cloud_name}/video/upload/{public_id}
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  /** f_auto lets Cloudinary pick webp/avif based on the browser's Accept header */
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  /** q_auto picks the best quality/size tradeoff automatically */
  quality?: number | "auto";
  fit?: "scale" | "fill" | "fit" | "crop" | "thumb";
}

/**
 * Build a Cloudinary image delivery URL with on-the-fly transforms.
 *
 * Example:
 *   cloudinaryImageUrl("mlrit/convocation-2024", { width: 800 })
 *   → https://res.cloudinary.com/mycloudname/image/upload/w_800,f_auto,q_auto/mlrit/convocation-2024
 */
export function cloudinaryImageUrl(
  publicId: string,
  opts: ImageTransformOptions = {}
): string {
  const transforms = buildTransforms(opts);
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  return transforms ? `${base}/${transforms}/${publicId}` : `${base}/${publicId}`;
}

/**
 * Build a Cloudinary video delivery URL.
 * Cloudinary streams video efficiently — preload="none" still recommended.
 */
export function cloudinaryVideoUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${publicId}`;
}

function buildTransforms(opts: ImageTransformOptions): string {
  const parts: string[] = [];
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  parts.push(`f_${opts.format ?? "auto"}`);
  parts.push(`q_${opts.quality ?? "auto"}`);
  if (opts.fit) parts.push(`c_${opts.fit}`);
  return parts.join(",");
}
