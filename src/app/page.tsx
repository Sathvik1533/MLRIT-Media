import Link from "next/link";
import { MEDIA_ASSETS, getImages, getVideos } from "@/lib/media";
import { MediaGrid } from "@/components/media/MediaGrid";

export default function HomePage() {
  const featured = MEDIA_ASSETS.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100 px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Official Media Gallery
            </span>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              MLRIT Campus <br />
              <span className="text-blue-600">Moments</span>
            </h1>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              {getImages().length} photos and {getVideos().length} videos from
              events, sports, cultural fests, and campus life.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/gallery"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Gallery
              </Link>
              <Link
                href="/videos"
                className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Watch Videos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-8">
          {[
            { label: "Total Assets", value: MEDIA_ASSETS.length },
            { label: "Photos", value: getImages().length },
            { label: "Videos", value: getVideos().length },
            { label: "Categories", value: 6 },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured grid */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Highlights</h2>
          <Link
            href="/gallery"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            View all →
          </Link>
        </div>
        <MediaGrid assets={featured} />
      </main>
    </>
  );
}
