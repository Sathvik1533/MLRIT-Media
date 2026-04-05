/**
 * VideoCard — plays Cloudinary-hosted videos inline.
 *
 * WHY preload="none": With 40+ assets on the page, preloading all videos
 * would destroy load performance. Videos only load when the user clicks play.
 */

import { cloudinaryVideoUrl } from "@/lib/cloudinary";
import type { MediaAsset } from "@/types/media";

interface VideoCardProps {
  asset: MediaAsset;
  className?: string;
}

export function VideoCard({ asset, className }: VideoCardProps) {
  const src = cloudinaryVideoUrl(asset.cloudinaryPublicId);

  return (
    <div className={className}>
      <video
        src={src}
        controls
        preload="none"
        className="w-full rounded-lg"
        aria-label={asset.title}
      />
    </div>
  );
}
