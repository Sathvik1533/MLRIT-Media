/**
 * Gallery page — Server Component shell.
 *
 * WHY keep this as a server component?
 *   - Metadata (title, description for Google) runs on the server
 *   - The page URL + shell renders instantly (no JS needed for the frame)
 *   - GalleryClient handles the live data fetch
 *
 * The CategoryFilter and GalleryClient both need to read URL search params.
 * Both must be in Suspense because useSearchParams() can suspend during
 * Next.js route transitions.
 */

import { Suspense } from "react";
import { CategoryFilter } from "@/components/media/CategoryFilter";
import { GalleryClient } from "./GalleryClient";
import { MediaGridSkeleton } from "@/components/ui/Skeleton";

export const metadata = {
  title: "Gallery — MLRIT Media",
  description: "Photos and videos from MLRIT events, campus, and activities",
};

export default function GalleryPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 pb-16">
      <h1
        className="leading-none mb-4"
        style={{
          fontFamily: "var(--font-geist)",
          fontWeight: 800,
          fontSize: "clamp(32px, 4vw, 48px)",
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          color: "var(--text)",
        }}
      >
        Gallery
      </h1>

      {/* CategoryFilter reads URL params — must be in Suspense */}
      <Suspense fallback={<div className="h-20" />}>
        <CategoryFilter />
      </Suspense>

      {/* GalleryClient fetches live data + shows HUD */}
      <Suspense fallback={<><p className="mb-8 text-sm" style={{ color: "var(--text-3)" }}>Loading…</p><MediaGridSkeleton /></>}>
        <GalleryClient />
      </Suspense>
    </main>
  );
}
