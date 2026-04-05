/**
 * Cloudflare URL builders for zero-lag media delivery.
 *
 * WHY this file exists: all CDN logic lives here so components never
 * hard-code URLs. Swap CDN provider by changing only this file.
 */

const CF_IMAGES_BASE =
  process.env.NEXT_PUBLIC_CF_IMAGES_BASE_URL ?? "https://imagedelivery.net";
const CF_ACCOUNT_ID = process.env.NEXT_PUBLIC_CF_ACCOUNT_ID ?? "";
const CF_R2_PUBLIC_URL = process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL ?? "";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  /** "auto" lets Cloudflare pick webp/avif based on Accept header */
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  quality?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
}

/**
 * Build a Cloudflare Images delivery URL with optional transforms.
 *
 * Example output:
 *   https://imagedelivery.net/{accountId}/{imageId}/w=800,format=auto
 */
export function cfImageUrl(
  cfImageId: string,
  opts: ImageTransformOptions = {}
): string {
  const variant = buildVariant(opts);
  return `${CF_IMAGES_BASE}/${CF_ACCOUNT_ID}/${cfImageId}/${variant}`;
}

function buildVariant(opts: ImageTransformOptions): string {
  const parts: string[] = [];
  if (opts.width) parts.push(`w=${opts.width}`);
  if (opts.height) parts.push(`h=${opts.height}`);
  if (opts.format) parts.push(`format=${opts.format}`);
  if (opts.quality) parts.push(`quality=${opts.quality}`);
  if (opts.fit) parts.push(`fit=${opts.fit}`);
  return parts.length > 0 ? parts.join(",") : "public";
}

/**
 * Build a Cloudflare R2 video URL.
 * Videos are served directly — keep clips ≤10MB for <50ms TTFB.
 */
export function r2VideoUrl(r2Key: string): string {
  return `${CF_R2_PUBLIC_URL}/${r2Key}`;
}
