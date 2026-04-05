import { MediaGrid } from "@/components/media/MediaGrid";
import { getVideos } from "@/lib/media";

export const metadata = {
  title: "Videos — MLRIT Media",
  description: "Video highlights from MLRIT events",
};

export default function VideosPage() {
  const videos = getVideos();

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
        Videos
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--text-3)" }}>
        {videos.length} videos from campus events
      </p>
      <MediaGrid assets={videos} />
    </main>
  );
}
