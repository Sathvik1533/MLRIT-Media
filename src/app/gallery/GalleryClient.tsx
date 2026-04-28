"use client";

import { useState, useEffect } from "react";
import { CategoryFilter } from "@/components/media/CategoryFilter";
import { MediaGrid } from "@/components/media/MediaGrid";
import { RedisMetricsDashboard } from "@/components/ui/RedisMetricsDashboard";
import type { Media } from "@prisma/client";
import type { MediaCategory, MediaType } from "@/types/media";

interface GalleryClientProps {
  initialMedia: Media[];
  category?: MediaCategory;
  type?: MediaType;
  search?: string;
}

export default function GalleryClient({
  initialMedia,
  category,
  type,
  search,
}: GalleryClientProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [loading, setLoading] = useState(false);

  // Fetch media when filters change
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (type) params.set("type", type);
        if (search) params.set("q", search);

        const response = await fetch(`/api/media?${params.toString()}`);
        const data = await response.json();
        setMedia(data.media || []);
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if filters are present (otherwise use initialMedia)
    if (category || type || search) {
      fetchMedia();
    } else {
      setMedia(initialMedia);
    }
  }, [category, type, search, initialMedia]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Redis Metrics Dashboard - TOP SECTION */}
      <RedisMetricsDashboard />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Media Gallery
          </h1>
          <p className="text-gray-600">
            Browse college events, campus life, sports, and more
          </p>
        </div>

        {/* Filters */}
        <CategoryFilter />

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
            <p className="text-gray-500 mt-4">Loading media...</p>
          </div>
        ) : (
          <MediaGrid items={media} />
        )}
      </div>
    </div>
  );
}
