import Image from "next/image";
import { cloudinaryImageUrl } from "@/lib/cloudinary";

interface MediaImageProps {
  publicId: string;
  title: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Optimized image component using Cloudinary transformations
 */
export function MediaImage({
  publicId,
  title,
  width = 400,
  height = 400,
  className = "",
}: MediaImageProps) {
  const src = cloudinaryImageUrl(publicId, {
    width,
    height,
    fit: "fill",
    quality: "auto",
    format: "auto",
  });

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <Image
        src={src}
        alt={title}
        width={width}
        height={height}
        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}
