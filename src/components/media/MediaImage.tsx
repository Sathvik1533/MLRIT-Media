/**
 * MediaImage — wraps next/image with Cloudflare Images transforms.
 *
 * WHY: next/image handles lazy-loading, blur placeholders, and srcSet.
 * We inject Cloudflare's transform URL so the CDN resizes on the fly —
 * no need to pre-generate thumbnails.
 */

import Image from "next/image";
import { cfImageUrl } from "@/lib/cloudflare";
import type { MediaAsset } from "@/types/media";

interface MediaImageProps {
  asset: MediaAsset;
  /** Render width in px — used for Cloudflare transform + next/image sizing */
  displayWidth?: number;
  className?: string;
  /** Load eagerly (above the fold) */
  priority?: boolean;
}

export function MediaImage({
  asset,
  displayWidth = 800,
  className,
  priority = false,
}: MediaImageProps) {
  if (!asset.cfImageId) return null;

  const src = cfImageUrl(asset.cfImageId, {
    width: displayWidth,
    format: "auto",
    quality: 85,
  });

  const aspectRatio = asset.height / asset.width;
  const displayHeight = Math.round(displayWidth * aspectRatio);

  return (
    <Image
      src={src}
      alt={asset.title}
      width={displayWidth}
      height={displayHeight}
      className={className}
      priority={priority}
      placeholder={asset.blurDataURL ? "blur" : "empty"}
      blurDataURL={asset.blurDataURL}
      sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${displayWidth}px`}
    />
  );
}
