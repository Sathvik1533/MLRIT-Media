"use client";

import { useState } from "react";
import { cloudinaryVideoUrl } from "@/lib/cloudinary";
import type { MediaAsset } from "@/types/media";

interface VideoCardProps {
  asset: MediaAsset;
  className?: string;
}

export function VideoCard({ asset, className }: VideoCardProps) {
  const primarySrc = cloudinaryVideoUrl(asset.cloudinaryPublicId);
  const [src, setSrc] = useState(primarySrc);

  return (
    <div className={className} style={{ borderRadius: "8px", overflow: "hidden" }}>
      <div className="relative group/video">
        <video
          src={src}
          controls
          preload="none"
          className="w-full block"
          style={{ borderRadius: "8px" }}
          aria-label={asset.title}
          onError={() => {
            if (asset.cloudFrontUrl && src !== asset.cloudFrontUrl) {
              setSrc(asset.cloudFrontUrl);
            }
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/video:opacity-100 transition-opacity"
          style={{ borderRadius: "8px" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.9)" }}
          >
            <span className="text-black text-base" style={{ marginLeft: "2px" }}>▶</span>
          </div>
        </div>
      </div>
    </div>
  );
}
