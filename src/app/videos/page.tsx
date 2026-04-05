import { MediaGrid } from "@/components/media/MediaGrid";
import { getVideos } from "@/lib/media";

export const metadata = {
  title: "Videos — MLRIT Media",
  description: "Video highlights from MLRIT events",
};

export default function VideosPage() {
  const videos = getVideos();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">Videos</h1>
      <p className="text-gray-400 mb-8">{videos.length} videos from campus events</p>
      <MediaGrid assets={videos} />
    </main>
  );
}
