/**
 * MediaImage — wraps next/image with Cloudinary transforms.
 *
 * WHY: next/image handles lazy-loading, blur placeholders, and srcSet.
 * We inject Cloudinary's transform URL so the CDN resizes on the fly —
 * no need to pre-generate thumbnails. Cloudinary picks webp/avif per browser.
 */

import Image from "next/image";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import type { MediaAsset } from "@/types/media";

interface MediaImageProps {
  asset: MediaAsset;
  /** Render width in px — drives Cloudinary transform + next/image sizing */
  displayWidth?: number;
  className?: string;
  /** Load eagerly (above the fold — first 6 assets) */
  priority?: boolean;
}

export function MediaImage({
  asset,
  displayWidth = 800,
  className,
  priority = false,
}: MediaImageProps) {
  const src = cloudinaryImageUrl(asset.cloudinaryPublicId, {
    width: displayWidth,
    format: "auto",
    quality: "auto",
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
