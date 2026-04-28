import Link from "next/link";
import { getMedia, getMediaStats } from "@/lib/media";
import { MediaGrid } from "@/components/media/MediaGrid";

export default async function HomePage() {
  // Get latest 6 media items and stats
  const [featured, stats] = await Promise.all([
    getMedia({ limit: 6 }),
    getMediaStats(),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-blue-400 uppercase tracking-wide text-sm mb-4">OFFICIAL MEDIA GALLERY</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            MLRIT <span className="text-blue-400">Campus</span> Moments
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            <span className="text-3xl font-bold text-blue-400">{stats.total}</span> photos and videos from events, sports, cultural fests, and campus life.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/gallery"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Gallery
            </Link>
            <Link
              href="/videos"
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Watch Videos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.total}</div>
              <div className="text-slate-600">TOTAL ASSETS</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.images}</div>
              <div className="text-slate-600">PHOTOS</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.videos}</div>
              <div className="text-slate-600">VIDEOS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Media */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Recent Uploads</h2>
          <MediaGrid items={featured} />
          <div className="text-center mt-8">
            <Link
              href="/gallery"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Media →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
