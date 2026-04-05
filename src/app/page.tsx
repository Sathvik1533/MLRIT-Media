import Link from "next/link";
import { MEDIA_ASSETS, getImages, getVideos } from "@/lib/media";
import { MediaGrid } from "@/components/media/MediaGrid";

export default function HomePage() {
  const featured = MEDIA_ASSETS.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="px-6 pt-16 pb-0" style={{ background: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5"
              style={{ color: "var(--accent)" }}
            >
              <span className="inline-block w-6 h-px" style={{ background: "var(--accent)" }} />
              Official Media Gallery
            </div>
            <h1
              className="leading-none tracking-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 900,
                fontSize: "clamp(44px, 7vw, 80px)",
                letterSpacing: "-0.04em",
                color: "var(--text)",
              }}
            >
              MLRIT Campus{" "}
              <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
                Moments
              </em>
            </h1>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
              {getImages().length} photos and {getVideos().length} videos from
              events, sports, cultural fests, and campus life.
            </p>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Link
                href="/gallery"
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 hover:brightness-110"
                style={{ background: "var(--accent)", color: "#0a0a0a" }}
              >
                Browse Gallery
              </Link>
              <Link
                href="/videos"
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                }}
              >
                Watch Videos
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="mt-12 max-w-7xl mx-auto grid grid-cols-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          {[
            { label: "Total Assets", value: MEDIA_ASSETS.length, suffix: "+" },
            { label: "Photos", value: getImages().length },
            { label: "Videos", value: getVideos().length },
            { label: "Categories", value: 6 },
          ].map(({ label, value, suffix }) => (
            <div
              key={label}
              className="py-6 pr-8"
              style={{ borderRight: "1px solid var(--border)" }}
            >
              <p
                className="leading-none"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 900,
                  fontSize: "clamp(28px, 4vw, 44px)",
                  letterSpacing: "-0.04em",
                  color: "var(--text)",
                }}
              >
                {value}
                {suffix && (
                  <span style={{ color: "var(--accent)" }}>{suffix}</span>
                )}
              </p>
              <p
                className="mt-1 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-3)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured grid */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl tracking-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Recent Highlights
          </h2>
          <Link
            href="/gallery"
            className="text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            View all →
          </Link>
        </div>
        <MediaGrid assets={featured} />
      </main>
    </>
  );
}
