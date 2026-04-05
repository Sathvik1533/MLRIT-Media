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
      <p className="text-center py-12" style={{ color: "var(--text-3)" }}>
        No media found.
      </p>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
      {filtered.map((asset, index) => (
        <div key={asset.id} className="break-inside-avoid group">
          {asset.type === "image" ? (
            <div className="relative overflow-hidden rounded-lg">
              <MediaImage
                asset={asset}
                displayWidth={600}
                priority={index < 12}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div
                className="absolute inset-x-0 bottom-0 px-3 pt-8 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                  {asset.category}
                </p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">{asset.title}</p>
              </div>
            </div>
          ) : (
            <VideoCard asset={asset} />
          )}
          {asset.type === "video" && (
            <p className="mt-1.5 text-sm font-medium truncate" style={{ color: "var(--text-2)" }}>
              {asset.title}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function filterAssets(assets: MediaAsset[], filter?: MediaGalleryFilter): MediaAsset[] {
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
