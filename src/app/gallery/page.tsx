import { Suspense } from "react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { CategoryFilter } from "@/components/media/CategoryFilter";
import { MEDIA_ASSETS } from "@/lib/media";
import type { MediaCategory, MediaType } from "@/types/media";

export const metadata = {
  title: "Gallery — MLRIT Media",
  description: "Photos and videos from MLRIT events, campus, and activities",
};

interface GalleryPageProps {
  searchParams: Promise<{
    category?: string;
    type?: string;
    q?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { category, type, q } = await searchParams;

  const filter = {
    category: category as MediaCategory | undefined,
    type: type as MediaType | undefined,
    search: q,
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h1
        className="leading-none tracking-tight mb-1"
        style={{
          fontFamily: "var(--font-fraunces)",
          fontWeight: 900,
          fontSize: "clamp(32px, 5vw, 52px)",
          letterSpacing: "-0.04em",
          color: "var(--text)",
        }}
      >
        Gallery
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--text-3)" }}>
        {MEDIA_ASSETS.length} photos &amp; videos
      </p>

      <Suspense fallback={<div className="h-20" />}>
        <CategoryFilter />
      </Suspense>

      <MediaGrid assets={MEDIA_ASSETS} filter={filter} />
    </main>
  );
}
