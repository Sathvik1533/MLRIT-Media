/**
 * MediaGrid — masonry-style responsive grid for 40+ assets.
 *
 * WHY: First 6 assets are priority-loaded (above the fold).
 * The rest are lazy-loaded via Intersection Observer (built into next/image).
 * This directly targets the <50ms perceived load goal.
 */

import { MediaImage } from "./MediaImage";
import { VideoCard } from "./VideoCard";
import type { MediaAsset, MediaGalleryFilter } from "@/types/media";

interface MediaGridProps {
  assets: MediaAsset[];
  filter?: MediaGalleryFilter;
}

export function MediaGrid({ assets, filter }: MediaGridProps) {
  const filtered = filterAssets(assets, filter);

  if (filtered.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">No media found.</p>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {filtered.map((asset, index) => (
        <div key={asset.id} className="break-inside-avoid">
          {asset.type === "image" ? (
            <MediaImage
              asset={asset}
              displayWidth={600}
              priority={index < 6}
              className="w-full rounded-lg object-cover"
            />
          ) : (
            <VideoCard asset={asset} />
          )}
          <p className="mt-1 text-sm text-gray-600 truncate">{asset.title}</p>
        </div>
      ))}
    </div>
  );
}

function filterAssets(
  assets: MediaAsset[],
  filter?: MediaGalleryFilter
): MediaAsset[] {
  if (!filter) return assets;
  return assets.filter((a) => {
    if (filter.category && a.category !== filter.category) return false;
    if (filter.type && a.type !== filter.type) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      const matches =
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });
}
