import Link from "next/link";
import { MEDIA_ASSETS } from "@/lib/media";
import { MediaGrid } from "@/components/media/MediaGrid";

export default function HomePage() {
  // Show latest 6 assets on homepage — all eager-loaded (above the fold)
  const featured = MEDIA_ASSETS.slice(0, 6);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">MLRIT Media</h1>
        <p className="mt-2 text-lg text-gray-600">
          Campus life, events, and memories — {MEDIA_ASSETS.length} assets and counting.
        </p>
        <nav className="mt-4 flex gap-4">
          <Link
            href="/gallery"
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Full Gallery
          </Link>
          <Link
            href="/videos"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Videos
          </Link>
        </nav>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent</h2>
        <MediaGrid assets={featured} />
      </section>
    </main>
  );
}
