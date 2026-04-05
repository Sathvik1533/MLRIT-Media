import { MediaGrid } from "@/components/media/MediaGrid";
import { MEDIA_ASSETS } from "@/lib/media";

export const metadata = {
  title: "Gallery — MLRIT Media",
  description: "Photos and videos from MLRIT events, campus, and activities",
};

export default function GalleryPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Gallery</h1>
      <p className="text-gray-500 mb-8">
        {MEDIA_ASSETS.length} media assets
      </p>
      <MediaGrid assets={MEDIA_ASSETS} />
    </main>
  );
}
