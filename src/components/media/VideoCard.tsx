/**
 * VideoCard — plays R2-hosted videos inline.
 *
 * WHY preload="none": We have 40+ assets on the page.
 * Preloading all videos would destroy load performance.
 * Videos only load when the user clicks play.
 */

import { r2VideoUrl } from "@/lib/cloudflare";
import type { MediaAsset } from "@/types/media";

interface VideoCardProps {
  asset: MediaAsset;
  className?: string;
}

export function VideoCard({ asset, className }: VideoCardProps) {
  if (!asset.r2Key) return null;

  const src = r2VideoUrl(asset.r2Key);

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
