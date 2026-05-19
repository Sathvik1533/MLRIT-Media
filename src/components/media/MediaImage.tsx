"use client";

import { useState } from "react";
import Image from "next/image";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import type { MediaAsset } from "@/types/media";

interface MediaImageProps {
  asset: MediaAsset;
  displayWidth?: number;
  className?: string;
  priority?: boolean;
}

export function MediaImage({
  asset,
  displayWidth = 800,
  className,
  priority = false,
}: MediaImageProps) {
  const primarySrc = cloudinaryImageUrl(asset.cloudinaryPublicId, {
    width: displayWidth,
    format: "auto",
    quality: "auto",
  });
  const [src, setSrc] = useState(primarySrc);

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
      onError={() => {
        if (asset.cloudFrontUrl && src !== asset.cloudFrontUrl) {
          setSrc(asset.cloudFrontUrl);
        }
      }}
    />
  );
}
