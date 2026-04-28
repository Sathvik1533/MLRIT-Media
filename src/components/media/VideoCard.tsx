import { cloudinaryImageUrl } from "@/lib/cloudinary";

interface VideoCardProps {
  publicId: string;
  title: string;
  description?: string;
  duration?: number;
}

/**
 * Video card with thumbnail and play button
 */
export function VideoCard({
  publicId,
  title,
  description,
  duration,
}: VideoCardProps) {
  const thumbnailUrl = cloudinaryImageUrl(publicId, {
    width: 400,
    height: 400,
    fit: "fill",
    quality: "auto",
    format: "auto",
  });

  return (
    <div className="group relative overflow-hidden rounded-lg bg-gray-100 shadow-md hover:shadow-xl transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              className="w-8 h-8 text-black ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
