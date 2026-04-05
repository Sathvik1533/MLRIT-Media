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
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">Gallery</h1>
      <p className="text-gray-400 mb-6">{MEDIA_ASSETS.length} photos &amp; videos</p>

      {/*
        Suspense boundary is required here because CategoryFilter uses
        useSearchParams() — a client hook that reads URL state.
        Without Suspense, Next.js can't statically render this page.
      */}
      <Suspense fallback={<div className="h-20" />}>
        <CategoryFilter />
      </Suspense>

      <MediaGrid assets={MEDIA_ASSETS} filter={filter} />
    </main>
  );
}
