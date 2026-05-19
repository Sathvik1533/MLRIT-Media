"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { traceFetch, type SessionPulse } from "@/lib/telemetry";
import { MediaGrid } from "@/components/media/MediaGrid";
import { MediaGridSkeleton } from "@/components/ui/Skeleton";
import { PerformanceHUD } from "@/components/ui/PerformanceHUD";
import { InfrastructureHUD } from "@/components/ui/InfrastructureHUD";
import type { MediaAsset, MediaCategory } from "@/types/media";

export function GalleryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [pulse, setPulse] = useState<SessionPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const q = searchParams.get("q");
    const tag = searchParams.get("tag");
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return `/api/assets${qs ? `?${qs}` : ""}`;
  }, [searchParams]);

  // Retry handler — called only from click handlers where sync setState is fine.
  const loadAssets = useCallback(async () => {
    setError(null);
    setLoading(true);
    const url = buildApiUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const fetchPromise = traceFetch(url);
      const abortPromise = new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error("Request timed out"))
        );
      });
      const { data, pulse: newPulse } = await Promise.race([fetchPromise, abortPromise]);
      clearTimeout(timer);
      const result = data as { assets: MediaAsset[]; total: number };
      setAssets(result.assets ?? []);
      setTotal(result.total ?? 0);
      setPulse(newPulse);
      setLoading(false);
    } catch {
      clearTimeout(timer);
      setError("Failed to load media. Retry?");
      setLoading(false);
    }
  }, [buildApiUrl]);

  // Effect uses a local async function so no setState runs synchronously
  // in the effect body — all state updates happen after the first await.
  useEffect(() => {
    let cancelled = false;
    const url = buildApiUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    async function run() {
      try {
        const fetchPromise = traceFetch(url);
        const abortPromise = new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () =>
            reject(new Error("Request timed out"))
          );
        });
        const { data, pulse: newPulse } = await Promise.race([fetchPromise, abortPromise]);
        clearTimeout(timer);
        if (!cancelled) {
          const result = data as { assets: MediaAsset[]; total: number };
          setAssets(result.assets ?? []);
          setTotal(result.total ?? 0);
          setPulse(newPulse);
          setLoading(false);
        }
      } catch {
        clearTimeout(timer);
        if (!cancelled) {
          setError("Failed to load media. Retry?");
          setLoading(false);
        }
      }
    }

    run();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [buildApiUrl]);

  // Tag click: set ?tag=xyz in URL (triggers loadAssets via searchParams dependency).
  const handleTagClick = useCallback((tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("tag") === tag) {
      params.delete("tag"); // toggle off if already active
    } else {
      params.set("tag", tag);
    }
    router.push(`/gallery?${params.toString()}`);
  }, [searchParams, router]);

  // Fire-and-forget view increment; dedup within session to prevent double-counts.
  const viewedRef = useRef<Set<string>>(new Set());
  const handleView = useCallback((cloudinaryPublicId: string) => {
    if (viewedRef.current.has(cloudinaryPublicId)) return;
    viewedRef.current.add(cloudinaryPublicId);
    fetch(`/api/media/${encodeURIComponent(cloudinaryPublicId)}/view`, { method: "POST" });
  }, []);

  // Optimistic delete: remove from UI immediately, then call API.
  // If the API fails, re-add the asset back in its original position.
  const handleDelete = useCallback(async (id: string) => {
    const prev = assets;
    setAssets((a) => a.filter((x) => x.id !== id));
    setTotal((t) => t - 1);

    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setAssets(prev);
      setTotal(prev.length);
    }
  }, [assets]);

  // Optimistic edit: update title/category in UI immediately.
  // Rollback on API failure.
  const handleEdit = useCallback(async (
    id: string,
    title: string,
    category: MediaCategory,
    description: string,
  ) => {
    const prev = assets;
    setAssets((a) =>
      a.map((x) => (x.id === id ? { ...x, title, category, description: description || undefined } : x))
    );

    const res = await fetch(`/api/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, description }),
    });
    if (!res.ok) {
      setAssets(prev);
    }
  }, [assets]);

  return (
    <>
      <p className="mb-8 text-sm" style={{ color: "var(--text-3)" }}>
        {loading ? "Loading…" : `${total} photos & videos`}
      </p>

      {error && (
        <div
          className="mb-6 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-mono"
          style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--red)",
          }}
        >
          <span>{error}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAssets}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "var(--font-geist-mono)",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-3)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <MediaGridSkeleton />
      ) : (
        <MediaGrid
          assets={assets}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onView={handleView}
          onTagClick={handleTagClick}
        />
      )}

      <PerformanceHUD pulse={pulse} />
      <InfrastructureHUD pulse={pulse} />
    </>
  );
}
