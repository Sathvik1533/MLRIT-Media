import type { Media } from "@prisma/client";
import { MediaImage } from "./MediaImage";
import { VideoCard } from "./VideoCard";

interface MediaGridProps {
  items: Media[];
}

/**
 * Responsive grid layout for media items
 */
export function MediaGrid({ items }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No media found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <div key={item.id} className="group">
          {item.type === "image" ? (
            <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <MediaImage
                publicId={item.cloudinaryPublicId}
                title={item.title}
                className="aspect-square"
              />
              <div className="p-3 bg-white">
                <h3 className="font-medium text-gray-900 line-clamp-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <VideoCard
              publicId={item.cloudinaryPublicId}
              title={item.title}
              description={item.description || undefined}
              duration={item.duration || undefined}
            />
          )}
        </div>
      ))}
    </div>
  );
}
